import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Scan,
  Package,
  CreditCard,
  Banknote,
  CheckCircle,
  Zap,
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
import { SkeletonSearchResults } from "@/components/ui/SkeletonComponents";
import { useToast } from "@/contexts/ToastContext";
import { useHardwareScanner } from "@/hooks/useHardwareScanner";
import { cn } from "@/lib/utils";
import productService from "../products/productService";
import salesService from "../sales/salesService";

const scanStatus = {
  "looking-up": { label: "Looking up...", className: "text-muted-foreground" },
  added: { label: "Added to cart", className: "text-green-600" },
  "not-found": { label: "Product not found", className: "text-amber-600" },
  error: { label: "Lookup failed", className: "text-destructive" },
};

const VAT_RATE = 0.12;
const roundCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function Scanner() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [processingScan, setProcessingScan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [saleSuccessData, setSaleSuccessData] = useState(null);
  const [showChangeSummary, setShowChangeSummary] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [scanFlash, setScanFlash] = useState(false);
  const [nextTxCountdown, setNextTxCountdown] = useState(null);
  const { showToast } = useToast();
  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const amountInputRef = useRef(null);

  const subtotal = useMemo(
    () => cart.reduce(
      (sum, item) => sum + (Number(item.unit_price || item.price || 0) * item.quantity),
      0
    ),
    [cart]
  );
  const vat = useMemo(() => roundCurrency(subtotal * VAT_RATE), [subtotal]);
  const total = useMemo(() => roundCurrency(subtotal + vat), [subtotal, vat]);

  // Hardware barcode scanner (USB/Bluetooth keyboard-wedge)

  // Keep the barcode input focused so the scanner "types" into it
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const playBeep = (type = "success") => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = "square";
      oscillator.frequency.value = type === "success" ? 880 : 330;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio is not available; scanning still works without the beep
    }
  };

  const flashSuccess = () => {
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 400);
  };

  const handleScan = (scannedValue, target) => {
    // Clear whatever input the scanner "typed" into so it doesn't linger
    if (target === barcodeInputRef.current) setBarcodeInput("");
    else if (target === searchInputRef.current) setSearchTerm("");
    else if (target === amountInputRef.current) setAmountPaid("");
    processScannedBarcode(scannedValue);
  };

  // Attach the hardware barcode scanner listener
  useHardwareScanner(handleScan);

  // Process a scanned barcode - look up product and add to cart
  const processScannedBarcode = async (barcode) => {
    setProcessingScan(true);
    setLastScan({ barcode, status: "looking-up" });
    try {
      const response = await productService.getByBarcode(barcode);

      if (response.data) {
        addToCart(response.data);
        setLastScan({ barcode, status: "added" });
        flashSuccess();
        playBeep("success");
      } else {
        setLastScan({ barcode, status: "not-found" });
        playBeep("error");
        showToast(`Product not found for ${barcode}`, "warning");
      }
    } catch {
      setLastScan({ barcode, status: "error" });
      playBeep("error");
      showToast("Barcode lookup failed", "error");
    } finally {
      setProcessingScan(false);
      barcodeInputRef.current?.focus();
    }
  };

  // Add a recognized product to the cart
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchTerm("");
    setSearchResults([]);
    searchInputRef.current?.focus();
    showToast(`${product.name} added to cart`, "success");
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const value = barcodeInput;
    setBarcodeInput("");
    processScannedBarcode(value);
  };

  const handleSearch = (val) => {
    setSearchTerm(val);
  };

  useEffect(() => {
    let cancelled = false;
    const handler = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await productService.getAll({ search: searchTerm, limit: 5 });
        if (!cancelled) {
          setSearchResults(response.data || []);
        }
      } catch {
        if (!cancelled) {
          showToast("Search error occurred", "error");
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [searchTerm, showToast]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

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
      playBeep("success");
      setCart([]);
      setAmountPaid("");
    } catch (error) {
      const message = error.message || "Checkout failed";
      showToast(message, "error");
      playBeep("error");
    } finally {
      setLoading(false);
      barcodeInputRef.current?.focus();
    }
  };

  const resetForNextTransaction = useCallback(() => {
    setShowChangeSummary(false);
    setSaleSuccessData(null);
    setAmountPaid("");
    setNextTxCountdown(null);
    setCart([]);
    setSearchTerm("");
    setLastScan(null);
    barcodeInputRef.current?.focus();
  }, []);

  // Auto-advance to the next transaction after 5 seconds
  useEffect(() => {
    if (!showChangeSummary || !saleSuccessData) return;

    setNextTxCountdown(5);
    const countdownInterval = setInterval(() => {
      setNextTxCountdown((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
    }, 1000);

    const timer = setTimeout(() => {
      resetForNextTransaction();
    }, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(timer);
    };
  }, [showChangeSummary, saleSuccessData, resetForNextTransaction]);

  const statusInfo = lastScan ? scanStatus[lastScan.status] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Pane: Search and Cart */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Scan items with the barcode scanner or search manually.</CardDescription>
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
               {searchLoading ? (
                 <div className="absolute z-10 w-full mt-1">
                   <SkeletonSearchResults />
                 </div>
               ) : searchResults.length > 0 ? (
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
               ) : null}
             </div>

            <div className={cn(
              "rounded-xl border-2 p-4 transition-colors",
              scanFlash ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-dashed"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Zap className={cn("h-4 w-4", scanFlash ? "text-green-600" : "text-primary")} />
                  Barcode Scanner
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {processingScan ? "Reading..." : "Ready"}
                </span>
              </div>

              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Scan className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={barcodeInputRef}
                    placeholder="Scan or type barcode..."
                    className="pl-10 h-12 text-lg font-mono"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    disabled={processingScan}
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={processingScan || !barcodeInput}>
                  Enter
                </Button>
              </form>

              {lastScan && statusInfo && (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">
                    Last scan: {lastScan.barcode}
                  </span>
                  <span className={cn("font-semibold", statusInfo.className)}>
                    {statusInfo.label}
                  </span>
                </div>
              )}
            </div>
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
                      onClick={resetForNextTransaction}
                    >
                      Next Transaction
                    </Button>
                    <p className="text-center text-sm font-medium text-primary">
                      Next transaction starts automatically in {nextTxCountdown}s...
                    </p>
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
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>₱0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (12%)</span>
                    <span>₱{vat.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-end">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-black text-blue-600">
                      ₱{total.toLocaleString()}
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
                         ref={amountInputRef}
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
                      parseFloat(amountPaid) >= total
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      <span className="text-sm font-bold uppercase tracking-tight">
                        {parseFloat(amountPaid) >= total ? "Change Due" : "Balance Due"}
                      </span>
                      <span className="text-2xl font-black">
                        ₱{Math.abs(parseFloat(amountPaid) - total).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Button
                    className="w-full h-16 text-lg font-bold shadow-lg"
                    size="lg"
                    disabled={cart.length === 0 || loading || !amountPaid || parseFloat(amountPaid) < total}
                    onClick={handleCheckout}
                  >
                    {loading ? "Processing..." : "Complete Sale"}
                    {!loading && <CreditCard className="ml-2 h-5 w-5" />}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
          <CardFooter className="flex flex-col items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 py-4 border-t">
            <div className="flex items-center gap-1 font-medium">
              <Scan className="h-3 w-3" /> AVRYX SCANNER v2.0
            </div>
            <p>Ready for next transaction</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}