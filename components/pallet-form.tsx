"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PalletData {
  id: string
  productCode: string
  quantity: number
  entryDate: string
  expiryDate: string
  status: "normal" | "expiring" | "expired" | "processing" | "reserved"
  color: string
  products: any[]
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  supplier: string
  notes: string
}

interface PalletFormProps {
  isOpen: boolean
  onClose: () => void
  pallet: PalletData | null
  onSave: (palletData: Partial<PalletData>) => void
  slotLocation?: string
}

export function PalletForm({ isOpen, onClose, pallet, onSave, slotLocation }: PalletFormProps) {
  const [formData, setFormData] = useState({
    productCode: "",
    quantity: 0,
    entryDate: "",
    expiryDate: "",
    status: "normal" as const,
    weight: 0,
    length: 120,
    width: 100,
    height: 80,
    supplier: "",
    notes: "",
  })

  useEffect(() => {
    if (pallet) {
      setFormData({
        productCode: pallet.productCode,
        quantity: pallet.quantity,
        entryDate: pallet.entryDate,
        expiryDate: pallet.expiryDate,
        status: pallet.status,
        weight: pallet.weight,
        length: pallet.dimensions.length,
        width: pallet.dimensions.width,
        height: pallet.dimensions.height,
        supplier: pallet.supplier,
        notes: pallet.notes,
      })
    } else {
      setFormData({
        productCode: "",
        quantity: 0,
        entryDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        status: "normal",
        weight: 0,
        length: 120,
        width: 100,
        height: 80,
        supplier: "",
        notes: "",
      })
    }
  }, [pallet, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const statusColors = {
      normal: "#4ade80",
      expiring: "#fbbf24",
      expired: "#ef4444",
      processing: "#3b82f6",
      reserved: "#8b5cf6",
    }

    const palletData: Partial<PalletData> = {
      productCode: formData.productCode,
      quantity: formData.quantity,
      entryDate: formData.entryDate,
      expiryDate: formData.expiryDate,
      status: formData.status,
      color: statusColors[formData.status],
      weight: formData.weight,
      dimensions: {
        length: formData.length,
        width: formData.width,
        height: formData.height,
      },
      supplier: formData.supplier,
      notes: formData.notes,
    }

    onSave(palletData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pallet ? "Edit Pallet" : "Add New Pallet"}
            {slotLocation && <span className="text-sm font-normal text-gray-500 ml-2">- {slotLocation}</span>}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productCode">Product Code *</Label>
                  <Input
                    id="productCode"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entryDate">Entry Date *</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="expiring">Expiring</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Physical Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Input
                    placeholder="Length"
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: Number.parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="Width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: Number.parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="Height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{pallet ? "Update Pallet" : "Create Pallet"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
