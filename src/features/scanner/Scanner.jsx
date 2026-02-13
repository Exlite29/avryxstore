import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Scan, 
  Camera, 
  Package, 
  CreditCard,
  Banknote,
  CheckCircle,
  X,
  Eye,
  Loader2,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/contexts/ToastContext";
import productService from "../products/productService";
import salesService from "../sales/salesService";
import visualRecognitionService from "./visualRecognitionService";
import Quagga from "@ericblade/quagga2";

export function Scanner() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [processingScan, setProcessingScan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [saleSuccessData, setSaleSuccessData] = useState(null);
  const [showChangeSummary, setShowChangeSummary] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState(null);
  const [showRecognitionDialog, setShowRecognitionDialog] = useState(false);
  const { showToast } = useToast();
  const searchInputRef = useRef(null);
  
  // Scanner refs
  const lastScannedRef = useRef("");
  const scanTimeoutRef = useRef(null);
  const scannerInitializedRef = useRef(false);

  // Initialize scanner when scanning
  useEffect(() => {
    if (isScanning && !scannerInitializedRef.current) {
      initializeScanner();
    }
    
    return () => {
      if (scannerInitializedRef.current) {
        stopScanner();
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isScanning]);

  const initializeScanner = () => {
    console.log("Initializing Quagga scanner...");
    
    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: document.querySelector("#scanner-container"),
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 }
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: navigator.hardwareConcurrency || 4,
      frequency: 10,
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "upc_reader",
          "upc_e_reader",
          "code_128_reader",
          "code_39_reader",
          "code_93_reader",
          "codabar_reader",
          "i2of5_reader",
          "2of5_reader"
        ]
      },
      locate: true
    }, (err) => {
      if (err) {
        console.error("Quagga init error:", err);
        setCameraError("Failed to initialize scanner: " + err.message);
        setIsScanning(false);
        return;
      }
      
      console.log("Quagga initialized successfully");
      scannerInitializedRef.current = true;
      Quagga.start();
      setCameraError(null);
      showToast("Scanner ready - point at barcode", "success");
    });

    // Set up barcode detection handler
    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      
      // Basic validation for scanned code
      if (!code || code.length < 3) return;

      if (code !== lastScannedRef.current) {
        lastScannedRef.current = code;
        
        // Reset lastScannedRef after 2 seconds to allow re-scanning the same item
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => {
          lastScannedRef.current = "";
        }, 2000);

        handleBarcodeDetected(code);
      }
    });

    // ... (processed frame handler remains the same)
    Quagga.onProcessed((result) => {
      const drawingCtx = Quagga.canvas.ctx.overlay;
      const drawingCanvas = Quagga.canvas.dom.overlay;
      
      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
          result.boxes.filter(box => box !== result.box).forEach(box => {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
              color: "green",
              lineWidth: 2
            });
          });
        }
        
        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: "#00F",
            lineWidth: 2
          });
        }
        
        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(result.line, { x: "x", y: "y" }, drawingCtx, {
            color: "red",
            lineWidth: 3
          });
        }
      }
    });
  };

  const stopScanner = () => {
    console.log("Stopping Quagga scanner...");
    try {
      if (scannerInitializedRef.current) {
        Quagga.stop();
        scannerInitializedRef.current = false;
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
    setIsScanning(false);
    lastScannedRef.current = "";
  };

  // Capture a frame from the live Quagga video feed
  const captureFrame = () => {
    const video = document.querySelector("#scanner-container video");
    if (!video) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  // AI Visual Recognition handler
  const handleVisualRecognize = async () => {
    if (!isScanning || !scannerInitializedRef.current) {
      showToast("Open the camera first to use AI recognition", "warning");
      return;
    }

    const base64Image = captureFrame();
    if (!base64Image) {
      showToast("Could not capture image from camera", "error");
      return;
    }

    setIsRecognizing(true);
    try {
      const response = await visualRecognitionService.recognizeFromBase64(base64Image);
      const results = response?.data || response;

      setRecognitionResults(results);
      setShowRecognitionDialog(true);

      const matchCount = results?.matchedProducts?.length || results?.allRankedProducts?.length || 0;
      if (matchCount > 0) {
        showToast(`Found ${matchCount} potential match${matchCount > 1 ? "es" : ""}`, "success");
      } else {
        showToast("No products matched. Try scanning the barcode.", "warning");
      }
    } catch (error) {
      console.error("Visual recognition error:", error);
      showToast(error.message || "Visual recognition failed", "error");
    } finally {
      setIsRecognizing(false);
    }
  };

  // Add a recognized product to the cart
  const addRecognizedProduct = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      unit_price: product.unit_price,
      category: product.category,
      stock_quantity: product.stock_quantity,
    });
    setShowRecognitionDialog(false);
  };

  const toggleCamera = () => {
    if (isScanning) {
      stopScanner();
    } else {
      setIsScanning(true);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    if (processingScan) return;
    await processScannedBarcode(barcode);
  };

  // Process a scanned barcode - look up product and add to cart
  const processScannedBarcode = async (barcode) => {
    setProcessingScan(true);
    try {
      const response = await productService.getByBarcode(barcode);
      
      if (response.data) {
        addToCart(response.data);
        // Visual feedback
        const container = document.querySelector("#scanner-container");
        if (container) {
          container.classList.add("scan-success-flash");
          setTimeout(() => container.classList.remove("scan-success-flash"), 300);
        }
      } else {
        showToast(`Product not found for ${barcode}`, "warning");
      }
    } catch (error) {
      console.error("Lookup error:", error);
      showToast("Barcode lookup failed", "error");
    } finally {
      setProcessingScan(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      
      try {
        const response = await productService.getAll({ search: searchTerm, limit: 5 });
        setSearchResults(response.data || []);
      } catch {
        showToast("Search error occurred", "error");
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSearch = (val) => {
    setSearchTerm(val);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSearchTerm("");
    setSearchResults([]);
    searchInputRef.current?.focus();
    showToast(`${product.name} added to cart`, "success");
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput) return;
    
    setLoading(true);
    try {
      const response = await productService.getByBarcode(barcodeInput);
      const product = response.data;
      if (product) {
        addToCart(product);
        setBarcodeInput("");
      } else {
        showToast("Product not found", "error");
      }
    } catch {
      showToast("Scan failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (Number(item.unit_price || item.price || 0) * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    
    if (paid < total) {
      showToast(`Insufficient payment. Need ₱${(total - paid).toLocaleString()}`, "error");
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price || item.price || 0
        })),
        payment_method: "cash",
        amount_paid: paid,
        discount: 0
      };
      
      const response = await salesService.create(saleData);
      
      // Store success data for the summary
      setSaleSuccessData(response.data || response);
      setShowChangeSummary(true);
      
      showToast("Sale completed successfully!", "success");
      setCart([]);
      setAmountPaid("");
    } catch (error) {
      const message = error.message || "Checkout failed";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Pane: Search and Cart */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Search for products or type a barcode manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search products by name or barcode..."
                className="pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg overflow-hidden">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted text-left border-b last:border-0"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{product.barcode}</div>
                        </div>
                      </div>
                      <div className="font-bold">₱{Number(product.unit_price || product.price || 0).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Direct Barcode Entry..."
                  className="pl-10"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" variant="secondary" disabled={loading || !barcodeInput}>
                Enter
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Order</CardTitle>
              <CardDescription>{cart.length} items in list</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCart([])} disabled={cart.length === 0}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <ShoppingCart className="h-12 w-12 opacity-20" />
                <p>Order is empty</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono uppercase">{item.barcode}</div>
                        </TableCell>
                        <TableCell className="text-center">₱{Number(item.unit_price || item.price || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ₱{(Number(item.unit_price || item.price || 0) * item.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Pane: Checkout */}
      <div className="flex flex-col gap-6">
        <Card className="sticky top-6 overflow-hidden">
          {showChangeSummary && saleSuccessData ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="bg-primary text-primary-foreground pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <CardTitle>Sale Complete</CardTitle>
                  </div>
                  <CardDescription className="text-primary-foreground/80">
                    Transaction recorded successfully.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground font-medium">Total Amount</span>
                      <span className="text-xl font-bold">₱{Number(saleSuccessData.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground font-medium">Payment Received</span>
                      <span className="text-xl font-bold">₱{Number(saleSuccessData.payment_received).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-primary/5 rounded-lg px-3">
                      <span className="text-primary font-bold">Change Given</span>
                      <span className="text-3xl font-black text-primary">₱{Number(saleSuccessData.change_given).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="w-full h-12 font-bold" 
                      onClick={() => {
                        setShowChangeSummary(false);
                        setSaleSuccessData(null);
                        setAmountPaid("");
                      }}
                    >
                      Next Transaction
                    </Button>
                    <Button variant="outline" className="w-full h-12" asChild>
                      <Link to="/sales">View History</Link>
                    </Button>
                  </div>
                </CardContent>
             </div>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Finalize the transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₱{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>₱0.00</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-end">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-black text-blue-600">
                      ₱{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-primary" />
                      Amount Paid
                    </label>
                    <div className="relative">
                       <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">₱</span>
                       <Input
                         type="number"
                         placeholder="0.00"
                         className="pl-8 h-12 text-xl font-bold"
                         value={amountPaid}
                         onChange={(e) => setAmountPaid(e.target.value)}
                         disabled={loading}
                       />
                    </div>
                  </div>

                  {amountPaid && parseFloat(amountPaid) > 0 && (
                    <div className={`p-4 rounded-lg flex justify-between items-center ${
                      parseFloat(amountPaid) >= calculateTotal() 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      <span className="text-sm font-bold uppercase tracking-tight">
                        {parseFloat(amountPaid) >= calculateTotal() ? "Change Due" : "Balance Due"}
                      </span>
                      <span className="text-2xl font-black">
                        ₱{Math.abs(parseFloat(amountPaid) - calculateTotal()).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Button 
                    className="w-full h-16 text-lg font-bold shadow-lg" 
                    size="lg"
                    disabled={cart.length === 0 || loading || !amountPaid || parseFloat(amountPaid) < calculateTotal()}
                    onClick={handleCheckout}
                  >
                    {loading ? "Processing..." : "Complete Sale"}
                    {!loading && <CreditCard className="ml-2 h-5 w-5" />}
                  </Button>                   <div className="grid grid-cols-2 gap-2">
                     <Button 
                       variant="outline" 
                       className="w-full h-12"
                       onClick={toggleCamera}
                     >
                       <Camera className="mr-2 h-4 w-4" />
                       {isScanning ? "Close Camera" : "Camera"}
                     </Button>
                     <Button 
                       variant="outline" 
                       className="w-full h-12 border-violet-300 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                       onClick={handleVisualRecognize}
                       disabled={!isScanning || isRecognizing}
                     >
                       {isRecognizing ? (
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       ) : (
                         <Eye className="mr-2 h-4 w-4" />
                       )}
                       {isRecognizing ? "Analyzing..." : "AI Identify"}
                     </Button>
                   </div>
                  
                  {cameraError && (
                    <div className="w-full p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
                      <p className="font-medium text-destructive mb-2">{cameraError}</p>
                      <div className="text-muted-foreground">
                        <p className="font-medium mb-1">To fix this:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Click "Allow" when prompted for camera access</li>
                          <li>If no prompt appeared, check browser address bar for camera icon</li>
                          <li>Make sure no other app is using your camera</li>
                          <li>Try refreshing the page</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}
          <CardFooter className="flex flex-col items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 py-4 border-t">
            <div className="flex items-center gap-1 font-medium">
              <Scan className="h-3 w-3" /> AVRYX SCANNER v1.1
            </div>
            <p>Ready for next transaction</p>
          </CardFooter>
        </Card>
        
        {/* Scanner container */}
        <div 
          id="scanner-container" 
          className={isScanning ? '' : 'hidden'}
          style={{ 
            width: '100%', 
            position: 'relative',
            minHeight: '400px',
            backgroundColor: 'black'
          }}
        />
      </div>

      {/* AI Recognition Results Dialog */}
      <Dialog open={showRecognitionDialog} onOpenChange={setShowRecognitionDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-violet-600" />
              AI Recognition Results
            </DialogTitle>
            <DialogDescription>
              Select a product to add to the cart.
            </DialogDescription>
          </DialogHeader>

          {recognitionResults && (
            <div className="space-y-3 mt-2">
              {/* Dominant Colors */}
              {recognitionResults.dominantColors && recognitionResults.dominantColors.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Detected colors:</span>
                  <div className="flex gap-1">
                    {recognitionResults.dominantColors.slice(0, 5).map((c, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: c.color }}
                        title={`${c.color} (${Math.round(c.percentage * 100)}%)`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Matched products */}
              {(recognitionResults.matchedProducts?.length > 0 || recognitionResults.allRankedProducts?.length > 0) ? (
                <div className="space-y-2">
                  {(recognitionResults.matchedProducts?.length > 0
                    ? recognitionResults.matchedProducts
                    : recognitionResults.allRankedProducts
                  ).map((product) => (
                    <button
                      key={product.id}
                      className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-violet-50 hover:border-violet-300 transition-colors text-left"
                      onClick={() => addRecognizedProduct(product)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.category}
                            {product.barcode && ` · ${product.barcode}`}
                          </div>
                          {product.matchScore && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="text-[10px] text-muted-foreground">Score: {product.matchScore}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">₱{Number(product.unit_price || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">Stock: {product.stock_quantity ?? "—"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground space-y-2">
                  <Package className="h-10 w-10 mx-auto opacity-20" />
                  <p className="font-medium">No matches found</p>
                  <p className="text-xs">Try scanning the barcode or searching manually.</p>
                </div>
              )}

              {/* Suggestions */}
              {recognitionResults.suggestions && recognitionResults.suggestions.length > 0 && (
                <div className="border-t pt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
                  {recognitionResults.suggestions.map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {s.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
