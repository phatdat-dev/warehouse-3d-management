"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Package, User, FileText, Calendar } from "lucide-react"

interface ProductData {
  id: string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  category: string
  description: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
}

interface PalletData {
  id: string
  productCode: string
  quantity: number
  entryDate: string
  expiryDate: string
  status: "normal" | "expiring" | "expired" | "processing" | "reserved"
  color: string
  products: ProductData[]
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  supplier: string
  notes: string
}

interface PalletModalProps {
  isOpen: boolean
  onClose: () => void
  pallet: PalletData | null
  slotLocation: string
  onEditPallet: (pallet: PalletData) => void
  onDeletePallet: () => void
  onAddProduct: () => void
  onEditProduct: (product: ProductData) => void
  onDeleteProduct: (productId: string) => void
}

export function PalletModal({
  isOpen,
  onClose,
  pallet,
  slotLocation,
  onEditPallet,
  onDeletePallet,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: PalletModalProps) {
  if (!pallet) return null

  const totalValue = pallet.products.reduce((sum, product) => sum + product.quantity * product.unitPrice, 0)
  const totalProducts = pallet.products.reduce((sum, product) => sum + product.quantity, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span>Pallet Details - {pallet.productCode}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => onEditPallet(pallet)} size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Pallet
              </Button>
              <Button onClick={onDeletePallet} size="sm" variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products ({pallet.products.length})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{slotLocation}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pallet Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product Code:</span>
                    <span className="font-medium">{pallet.productCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: pallet.color + "20",
                        borderColor: pallet.color,
                        color: pallet.color,
                      }}
                    >
                      {pallet.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Entry Date:</span>
                    <span className="font-medium">{pallet.entryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expiry Date:</span>
                    <span className="font-medium">{pallet.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supplier:</span>
                    <span className="font-medium">{pallet.supplier}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Physical Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weight:</span>
                    <span className="font-medium">{pallet.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dimensions:</span>
                    <span className="font-medium">
                      {pallet.dimensions.length} × {pallet.dimensions.width} × {pallet.dimensions.height} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Volume:</span>
                    <span className="font-medium">
                      {(
                        (pallet.dimensions.length * pallet.dimensions.width * pallet.dimensions.height) /
                        1000000
                      ).toFixed(2)}{" "}
                      m³
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {pallet.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{pallet.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Products in Pallet</h3>
              <Button onClick={onAddProduct} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {pallet.products.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pallet.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>${product.unitPrice}</TableCell>
                        <TableCell>${(product.quantity * product.unitPrice).toLocaleString()}</TableCell>
                        <TableCell>{product.expiryDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button onClick={() => onEditProduct(product)} size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button onClick={() => onDeleteProduct(product.id)} size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No products in this pallet</p>
                  <Button onClick={onAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Product
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Entry Date</div>
                      <div className="text-sm text-gray-600">{pallet.entryDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Expiry Date</div>
                      <div className="text-sm text-gray-600">{pallet.expiryDate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Supplier Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">{pallet.supplier}</div>
                    <div className="text-sm text-gray-600">Primary supplier for this pallet</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Pallet ID:</span>
                      <div className="text-gray-600">{pallet.id}</div>
                    </div>
                    <div>
                      <span className="font-medium">Product Categories:</span>
                      <div className="text-gray-600">
                        {Array.from(new Set(pallet.products.map((p) => p.category))).join(", ") || "None"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Batch Numbers:</span>
                      <div className="text-gray-600">
                        {Array.from(new Set(pallet.products.map((p) => p.batchNumber))).join(", ") || "None"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
