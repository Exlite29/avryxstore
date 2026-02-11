import { useState, useEffect, useRef } from "react";
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
  X
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
import { useToast } from "@/contexts/ToastContext";
import productService from "../products/productService";
import salesService from "../sales/salesService";
import Quagga from "@ericblade/quagga2";

export function Scanner() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const { showToast } = useToast();
  const searchInputRef = useRef(null);
  
  // Scanner refs
  const lastScannedRef = useRef("");
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
      console.log("Raw barcode detected:", JSON.stringify(code));
      console.log("Barcode length:", code.length);
      console.log("Barcode chars:", code.split('').map(c => c.charCodeAt(0)));
      
      if (code && code !== lastScannedRef.current) {
        lastScannedRef.current = code;
        handleBarcodeDetected(code);
      }
    });

    // Set up processed frame handler for visualization
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

  const toggleCamera = () => {
    if (isScanning) {
      stopScanner();
    } else {
      setIsScanning(true);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    console.log("Processing barcode:", barcode);
    await processScannedBarcode(barcode);
  };

  // Process a scanned barcode - look up product and add to cart
  const processScannedBarcode = async (barcode) => {
    console.log("Processing barcode:", barcode);
    try {
      const response = await productService.getByBarcode(barcode);
      console.log("API response status:", response.status);
      console.log("API response data:", response.data);
      
      if (response.data) {
        addToCart(response.data);
        showToast(`Scanned: ${response.data.name}`, "success");
      } else {
        console.log("Product not found for barcode:", barcode);
        showToast(`Product not found for ${barcode}`, "warning");
      }
    } catch (error) {
      console.error("API error:", error);
      showToast("Failed to lookup barcode", "error");
    }
  };

  const handleSearch = async (val) => {
    setSearchTerm(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await productService.getAll();
      const list = response.data || [];
      const filtered = list.filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase()) || 
        p.barcode?.includes(val)
      ).slice(0, 5);
      setSearchResults(filtered);
    } catch {
      showToast("Search error occurred", "error");
    }
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
    
    setLoading(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.unit_price || item.price || 0
        })),
        total_amount: calculateTotal()
      };
      
      await salesService.create(saleData);
      showToast("Sale completed successfully!", "success");
      setCart([]);
    } catch {
      showToast("Checkout failed", "error");
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
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Finalize the transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="pt-6 space-y-3">
              <Button 
                className="w-full h-16 text-lg font-bold" 
                size="lg"
                disabled={cart.length === 0 || loading}
                onClick={handleCheckout}
              >
                {loading ? "Processing..." : "Complete Sale"}
                {!loading && <CreditCard className="ml-2 h-5 w-5" />}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={toggleCamera}
              >
                <Camera className="mr-2 h-4 w-4" />
                {isScanning ? "Close Camera" : "Open Camera Scanner"}
              </Button>
              
              {/* Camera permission error with instructions */}
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
          <CardFooter className="flex flex-col items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 py-4">
            <div className="flex items-center gap-1 font-medium">
              <Scan className="h-3 w-3" /> AVRYX SCANNER v1.0
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
    </div>
  );
}
