"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Box, Html, OrbitControls, Text } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Download, Eye, MapPin, Package, Plus, Search, Upload } from "lucide-react"
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react"
import type * as THREE from "three"

import { PalletForm } from "@/components/pallet-form"
import { PalletModal } from "@/components/pallet-modal"
import { ProductForm } from "@/components/product-form"

// Extend window type for global functions
declare global {
  interface Window {
    handleEditPalletFromSlot?: (pallet: PalletData) => void
  }
}

// Error Boundary for 3D Canvas
class Canvas3DErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode; onError?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode; onError?: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Canvas Error:', error, errorInfo)
    this.props.onError?.()
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <div className="text-gray-500 mb-4">
              <Package className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">3D View Error</h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the 3D visualization.
            </p>
            <p className="text-sm text-gray-500">
              Please refresh the page or try a different browser.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Types
interface SlotData {
  id: string
  location: string
  aisle: string
  bay: string
  level: number
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
  occupied: boolean
  pallet?: PalletData
}

// Add new types for products within pallets
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

// Update PalletData to include products
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

// Simple seeded random number generator for consistent data generation
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max)
  }

  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

// Sample data
const generateWarehouseData = (): SlotData[] => {
  const rng = new SeededRandom(12345) // Fixed seed for consistent results
  const slots: SlotData[] = []
  const aisles = ["A", "B", "C", "D"]
  const baysPerAisle = 8
  const levelsPerBay = 4

  aisles.forEach((aisle, aisleIndex) => {
    for (let bay = 1; bay <= baysPerAisle; bay++) {
      for (let level = 1; level <= levelsPerBay; level++) {
        const x = aisleIndex * 6 - 9
        const z = bay * 2 - 8
        const y = level * 1.5 - 0.5

        const slotId = `${aisle}${bay.toString().padStart(2, "0")}${level}`
        const occupied = rng.next() > 0.3

        let pallet: PalletData | undefined
        if (occupied) {
          const statuses: PalletData["status"][] = ["normal", "expiring", "expired", "processing", "reserved"]
          const status = statuses[rng.nextInt(statuses.length)]
          const colors = {
            normal: "#4ade80",
            expiring: "#fbbf24",
            expired: "#ef4444",
            processing: "#3b82f6",
            reserved: "#8b5cf6",
          }

          pallet = {
            id: `P${rng.nextInt(1000000).toString(16).toUpperCase()}`,
            productCode: `PROD-${rng.nextInt(10000).toString(16).toUpperCase()}`,
            quantity: rng.nextInt(100) + 1,
            entryDate: new Date(Date.now() - rng.nextInt(30 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0],
            expiryDate: new Date(Date.now() + rng.nextInt(90 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0],
            status,
            color: colors[status],
            products: [],
            weight: 0,
            dimensions: { length: 120, width: 100, height: 80 },
            supplier: "",
            notes: "",
          }

          // Generate sample products for each pallet
          const productCount = rng.nextInt(3) + 1
          const products: ProductData[] = []

          for (let i = 0; i < productCount; i++) {
            products.push({
              id: `PROD-${rng.nextInt(1000000).toString(16).toUpperCase()}`,
              name: `Product ${i + 1}`,
              sku: `SKU-${rng.nextInt(1000000).toString(16).toUpperCase()}`,
              quantity: rng.nextInt(50) + 1,
              unitPrice: rng.nextInt(100) + 10,
              category: ["Electronics", "Clothing", "Food", "Tools", "Books"][rng.nextInt(5)],
              description: `Description for product ${i + 1}`,
              batchNumber: `BATCH-${rng.nextInt(10000).toString(16).toUpperCase()}`,
              manufacturingDate: new Date(Date.now() - rng.nextInt(60 * 24 * 60 * 60 * 1000))
                .toISOString()
                .split("T")[0],
              expiryDate: new Date(Date.now() + rng.nextInt(180 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0],
            })
          }

          // Update the existing pallet with the generated products and other properties
          pallet.products = products
          pallet.weight = rng.nextInt(500) + 100
          pallet.supplier = ["Supplier A", "Supplier B", "Supplier C"][rng.nextInt(3)]
          pallet.notes = "Sample pallet notes"
        }

        slots.push({
          id: slotId,
          location: slotId,
          aisle,
          bay: bay.toString().padStart(2, "0"),
          level,
          x,
          y,
          z,
          width: 1.2,
          height: 1.2,
          depth: 1.2,
          occupied,
          pallet,
        })
      }
    }
  })

  return slots
}

// 3D Components
function Slot({
  slot,
  isSelected,
  onSelect,
}: {
  slot: SlotData
  isSelected: boolean
  onSelect: (slot: SlotData) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const slotColor = isSelected ? "#ffffff" : "#e5e7eb"
  const palletColor = slot.pallet?.color || "#6b7280"

  return (
    <group position={[slot.x, slot.y, slot.z]} onClick={() => onSelect(slot)}>
      {/* Slot frame */}
      <Box ref={meshRef} args={[slot.width, slot.height, slot.depth]} position={[0, 0, 0]}>
        <meshStandardMaterial color={slotColor} wireframe transparent opacity={0.3} />
      </Box>

      {/* Pallet */}
      {slot.occupied && slot.pallet && (
        <Box args={[slot.width * 0.8, slot.height * 0.8, slot.depth * 0.8]} position={[0, 0, 0]}>
          <meshStandardMaterial color={palletColor} />
        </Box>
      )}

      {/* Slot label */}
      <Text position={[0, slot.height / 2 + 0.3, 0]} fontSize={0.2} color="#374151" anchorX="center" anchorY="middle">
        {slot.location}
      </Text>

      {/* Pallet info on hover */}
      {isSelected && slot.pallet && (
        <Html position={[0, slot.height / 2 + 0.8, 0]} center>
          <div className="bg-white p-2 rounded shadow-lg border text-xs min-w-48">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold">{slot.pallet.productCode}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // We need to pass this up to the parent component
                  if (window.handleEditPalletFromSlot && slot.pallet) {
                    window.handleEditPalletFromSlot(slot.pallet)
                  }
                }}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            </div>
            <div>Qty: {slot.pallet.quantity}</div>
            <div>
              Status:{" "}
              <Badge variant="outline" className="text-xs">
                {slot.pallet.status}
              </Badge>
            </div>
            <div>Entry: {slot.pallet.entryDate}</div>
            <div>Expiry: {slot.pallet.expiryDate}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function WarehouseFloor() {
  return (
    <Box args={[24, 0.1, 20]} position={[0, -1, 0]}>
      <meshStandardMaterial color="#f3f4f6" />
    </Box>
  )
}

function AisleLabels() {
  const aisles = ["A", "B", "C", "D"]

  return (
    <>
      {aisles.map((aisle, index) => (
        <Text
          key={aisle}
          position={[index * 6 - 9, -0.5, -10]}
          fontSize={0.8}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
        >
          AISLE {aisle}
        </Text>
      ))}
    </>
  )
}

function Warehouse3D({
  slots,
  selectedSlot,
  onSlotSelect,
  onError,
}: {
  slots: SlotData[]
  selectedSlot: SlotData | null
  onSlotSelect: (slot: SlotData) => void
  onError?: () => void
}) {
  const [hasWebGL, setHasWebGL] = useState(true)
  const [canvasError, setCanvasError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Check WebGL support
  useEffect(() => {
    if (!isClient) return
    
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setHasWebGL(false)
        setCanvasError('WebGL is not supported in your browser')
      }
    } catch (e) {
      console.error('WebGL check failed:', e)
      setHasWebGL(false)
      setCanvasError('WebGL is not supported in your browser')
      onError?.()
    }
  }, [isClient, onError])

  // Show loading state while checking client-side capabilities
  if (!isClient || isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing 3D view...</p>
        </div>
      </div>
    )
  }

  if (!hasWebGL || canvasError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-gray-500 mb-4">
            <Package className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">3D View Not Available</h3>
          <p className="text-gray-600 mb-4">
            {canvasError || 'Your browser does not support WebGL, which is required for 3D visualization.'}
          </p>
          <p className="text-sm text-gray-500">
            Please use a modern browser like Chrome, Firefox, Safari, or Edge.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full" style={{ minHeight: '600px' }}>
      <Canvas 
        camera={{ position: [15, 10, 15], fov: 60 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onCreated={({ gl, scene, camera }) => {
          try {
            gl.setClearColor('#f8fafc')
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            // Ensure camera is properly positioned
            camera.position.set(15, 10, 15)
            camera.lookAt(0, 0, 0)
          } catch (error) {
            console.error('Canvas setup error:', error)
            setCanvasError('Failed to initialize 3D renderer')
          }
        }}
        onError={(error) => {
          console.error('Canvas error:', error)
          setCanvasError('Failed to load 3D view')
          onError?.()
        }}
        fallback={
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading 3D view...</p>
            </div>
          </div>
        }
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <WarehouseFloor />
        <AisleLabels />

        {slots.map((slot) => (
          <Slot key={slot.id} slot={slot} isSelected={selectedSlot?.id === slot.id} onSelect={onSlotSelect} />
        ))}

        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}

// 2D Fallback View
function Warehouse2D({
  slots,
  selectedSlot,
  onSlotSelect,
}: {
  slots: SlotData[]
  selectedSlot: SlotData | null
  onSlotSelect: (slot: SlotData) => void
}) {
  const aisles = useMemo(() => {
    const grouped = slots.reduce((acc, slot) => {
      if (!acc[slot.aisle]) acc[slot.aisle] = []
      acc[slot.aisle].push(slot)
      return acc
    }, {} as Record<string, SlotData[]>)
    
    // Sort slots within each aisle by bay and level
    Object.keys(grouped).forEach(aisle => {
      grouped[aisle].sort((a, b) => {
        if (a.bay !== b.bay) return a.bay.localeCompare(b.bay)
        return a.level - b.level
      })
    })
    
    return grouped
  }, [slots])

  return (
    <div className="h-full w-full overflow-auto p-4 bg-gray-50">
      <div className="space-y-6">
        {Object.entries(aisles).map(([aisleName, aisleSlots]) => (
          <div key={aisleName} className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Aisle {aisleName}</h3>
            <div className="grid grid-cols-8 gap-2">
              {aisleSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => onSlotSelect(slot)}
                  className={`
                    relative h-12 w-12 rounded border-2 cursor-pointer transition-all
                    ${selectedSlot?.id === slot.id 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{
                    backgroundColor: slot.occupied 
                      ? slot.pallet?.color || '#6b7280'
                      : '#ffffff'
                  }}
                  title={`${slot.location} - ${slot.occupied ? `${slot.pallet?.productCode} (${slot.pallet?.status})` : 'Empty'}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {slot.location}
                    </span>
                  </div>
                  {slot.occupied && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
                         style={{ backgroundColor: slot.pallet?.color }}>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Component
export default function WarehouseManagement() {
  const [slots, setSlots] = useState<SlotData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [aisleFilter, setAisleFilter] = useState<string>("all")

  const [showPalletModal, setShowPalletModal] = useState(false)
  const [showPalletForm, setShowPalletForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingPallet, setEditingPallet] = useState<PalletData | null>(null)
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)

  // Initialize warehouse data on client side only
  useEffect(() => {
    setSlots(generateWarehouseData())
    setIsLoading(false)
  }, [])
  const [selectedPalletForProducts, setSelectedPalletForProducts] = useState<PalletData | null>(null)
  const [use3DView, setUse3DView] = useState(true)
  const [canvas3DError, setCanvas3DError] = useState(false)

  // Add this useEffect near the top of the component, after the state declarations
  useEffect(() => {
    // Make the edit function globally available for the 3D component
    window.handleEditPalletFromSlot = (pallet: PalletData) => {
      setEditingPallet(pallet)
      setShowPalletForm(true)
    }

    // Cleanup
    return () => {
      delete window.handleEditPalletFromSlot
    }
  }, [])

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesSearch =
        !searchTerm ||
        slot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.pallet?.productCode.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "empty" && !slot.occupied) ||
        (statusFilter !== "empty" && slot.pallet?.status === statusFilter)

      const matchesAisle = aisleFilter === "all" || slot.aisle === aisleFilter

      return matchesSearch && matchesStatus && matchesAisle
    })
  }, [slots, searchTerm, statusFilter, aisleFilter])

  const stats = useMemo(() => {
    const total = slots.length
    const occupied = slots.filter((s) => s.occupied).length
    const empty = total - occupied
    const expiring = slots.filter((s) => s.pallet?.status === "expiring").length
    const expired = slots.filter((s) => s.pallet?.status === "expired").length

    return { total, occupied, empty, expiring, expired }
  }, [slots])

  const handleSlotSelect = (slot: SlotData) => {
    setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)
  }

  const handleImportCSV = () => {
    // Simulate CSV import
    const newSlots = generateWarehouseData()
    setSlots(newSlots)
    setSelectedSlot(null)
  }

  const handleExportCSV = () => {
    const csvData = slots.map((slot) => ({
      Location: slot.location,
      Aisle: slot.aisle,
      Bay: slot.bay,
      Level: slot.level,
      Occupied: slot.occupied,
      ProductCode: slot.pallet?.productCode || "",
      Quantity: slot.pallet?.quantity || 0,
      Status: slot.pallet?.status || "",
      EntryDate: slot.pallet?.entryDate || "",
      ExpiryDate: slot.pallet?.expiryDate || "",
    }))

    console.log("Exporting CSV data:", csvData)
    alert("CSV export functionality would download the data here")
  }

  const handlePalletClick = (slot: SlotData) => {
    if (slot.pallet) {
      setSelectedPalletForProducts(slot.pallet)
      setShowPalletModal(true)
    }
    setSelectedSlot(slot)
  }

  const handleAddPallet = (slotId: string) => {
    setEditingPallet(null)
    setSelectedSlot(slots.find((s) => s.id === slotId) || null)
    setShowPalletForm(true)
  }

  const handleEditPallet = (pallet: PalletData) => {
    setEditingPallet(pallet)
    setShowPalletForm(true)
  }

  const handleDeletePallet = (slotId: string) => {
    if (confirm("Are you sure you want to delete this pallet?")) {
      setSlots((prev) =>
        prev.map((slot) => (slot.id === slotId ? { ...slot, occupied: false, pallet: undefined } : slot)),
      )
      setSelectedSlot(null)
      setShowPalletModal(false)
    }
  }

  const handleSavePallet = (palletData: Partial<PalletData>) => {
    if (editingPallet) {
      // Update existing pallet
      setSlots((prev) =>
        prev.map((slot) =>
          slot.pallet?.id === editingPallet.id
            ? { ...slot, pallet: { ...slot.pallet, ...palletData } as PalletData }
            : slot,
        ),
      )
    } else if (selectedSlot) {
      // Add new pallet
      const newPallet: PalletData = {
        id: `P${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        products: [],
        weight: 0,
        dimensions: { length: 120, width: 100, height: 80 },
        supplier: "",
        notes: "",
        ...palletData,
      } as PalletData

      setSlots((prev) =>
        prev.map((slot) => (slot.id === selectedSlot.id ? { ...slot, occupied: true, pallet: newPallet } : slot)),
      )
    }
    setShowPalletForm(false)
    setEditingPallet(null)
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductForm(true)
  }

  const handleEditProduct = (product: ProductData) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      if (selectedPalletForProducts) {
        const updatedProducts = selectedPalletForProducts.products.filter((p) => p.id !== productId)
        const updatedPallet = { ...selectedPalletForProducts, products: updatedProducts }

        setSlots((prev) =>
          prev.map((slot) =>
            slot.pallet?.id === selectedPalletForProducts.id ? { ...slot, pallet: updatedPallet } : slot,
          ),
        )

        setSelectedPalletForProducts(updatedPallet)
      }
    }
  }

  const handleSaveProduct = (productData: Partial<ProductData>) => {
    if (!selectedPalletForProducts) return

    let updatedProducts: ProductData[]

    if (editingProduct) {
      // Update existing product
      updatedProducts = selectedPalletForProducts.products.map((product) =>
        product.id === editingProduct.id ? { ...product, ...productData } : product,
      )
    } else {
      // Add new product
      const newProduct: ProductData = {
        id: `PROD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...productData,
      } as ProductData
      updatedProducts = [...selectedPalletForProducts.products, newProduct]
    }

    const updatedPallet = { ...selectedPalletForProducts, products: updatedProducts }

    setSlots((prev) =>
      prev.map((slot) =>
        slot.pallet?.id === selectedPalletForProducts.id ? { ...slot, pallet: updatedPallet } : slot,
      ),
    )

    setSelectedPalletForProducts(updatedPallet)
    setShowProductForm(false)
    setEditingProduct(null)
  }

  // Show loading state while data is being generated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading warehouse data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Warehouse 3D Management</h1>
                <p className="text-sm text-gray-600">Visual inventory and layout management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleImportCSV} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Warehouse Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Slots:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Occupied:</span>
                  <span className="font-semibold text-green-600">{stats.occupied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Empty:</span>
                  <span className="font-semibold text-gray-500">{stats.empty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expiring:</span>
                  <span className="font-semibold text-yellow-600">{stats.expiring}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expired:</span>
                  <span className="font-semibold text-red-600">{stats.expired}</span>
                </div>
              </CardContent>
            </Card>

            {/* Search & Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search & Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search location or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="empty">Empty</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="expiring">Expiring</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Aisle</label>
                  <Select value={aisleFilter} onValueChange={setAisleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Aisles</SelectItem>
                      <SelectItem value="A">Aisle A</SelectItem>
                      <SelectItem value="B">Aisle B</SelectItem>
                      <SelectItem value="C">Aisle C</SelectItem>
                      <SelectItem value="D">Aisle D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Selected Slot Info */}
            {selectedSlot && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Slot Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Location:</span>
                    <span className="ml-2">{selectedSlot.location}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Position:</span>
                    <span className="ml-2">
                      Aisle {selectedSlot.aisle}, Bay {selectedSlot.bay}, Level {selectedSlot.level}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={selectedSlot.occupied ? "default" : "secondary"} className="ml-2">
                      {selectedSlot.occupied ? "Occupied" : "Empty"}
                    </Badge>
                  </div>

                  {selectedSlot.pallet && (
                    <>
                      <hr />
                      <div>
                        <span className="text-sm font-medium">Product:</span>
                        <span className="ml-2">{selectedSlot.pallet.productCode}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Quantity:</span>
                        <span className="ml-2">{selectedSlot.pallet.quantity}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Entry Date:</span>
                        <span className="ml-2">{selectedSlot.pallet.entryDate}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Expiry Date:</span>
                        <span className="ml-2">{selectedSlot.pallet.expiryDate}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Status:</span>
                        <Badge
                          variant="outline"
                          className="ml-2"
                          style={{
                            backgroundColor: selectedSlot.pallet.color + "20",
                            borderColor: selectedSlot.pallet.color,
                            color: selectedSlot.pallet.color,
                          }}
                        >
                          {selectedSlot.pallet.status}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedSlot && !selectedSlot.occupied && (
              <div className="mt-4">
                <Button onClick={() => handleAddPallet(selectedSlot.id)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pallet to This Slot
                </Button>
              </div>
            )}

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="text-sm">Normal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-sm">Expiring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span className="text-sm">Expired</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="text-sm">Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-400 rounded"></div>
                  <span className="text-sm">Reserved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm">Empty</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3D Warehouse View */}
          <div className="lg:col-span-3">
            <Card className="h-[800px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  {use3DView ? '3D' : '2D'} Warehouse View
                  <span className="ml-auto text-sm font-normal text-gray-500 mr-4">
                    Showing {filteredSlots.length} of {slots.length} slots
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={use3DView ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUse3DView(true)}
                      disabled={canvas3DError}
                    >
                      3D
                    </Button>
                    <Button
                      variant={!use3DView ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUse3DView(false)}
                    >
                      2D
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div className="h-full w-full">
                  {use3DView && !canvas3DError ? (
                    <Canvas3DErrorBoundary onError={() => {
                      setCanvas3DError(true)
                      setUse3DView(false)
                    }}>
                      <Suspense fallback={
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading 3D view...</p>
                          </div>
                        </div>
                      }>
                        <Warehouse3D 
                          slots={filteredSlots} 
                          selectedSlot={selectedSlot} 
                          onSlotSelect={handleSlotSelect}
                          onError={() => {
                            setCanvas3DError(true)
                            setUse3DView(false)
                          }}
                        />
                      </Suspense>
                    </Canvas3DErrorBoundary>
                  ) : (
                    <Warehouse2D
                      slots={filteredSlots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={handleSlotSelect}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <PalletModal
          isOpen={showPalletModal}
          onClose={() => {
            setShowPalletModal(false)
            setSelectedPalletForProducts(null)
          }}
          pallet={selectedPalletForProducts}
          slotLocation={selectedSlot?.location || ""}
          onEditPallet={handleEditPallet}
          onDeletePallet={() => handleDeletePallet(selectedSlot?.id || "")}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        <PalletForm
          isOpen={showPalletForm}
          onClose={() => {
            setShowPalletForm(false)
            setEditingPallet(null)
          }}
          pallet={editingPallet}
          onSave={handleSavePallet}
          slotLocation={selectedSlot?.location}
        />

        <ProductForm
          isOpen={showProductForm}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          product={editingProduct}
          onSave={handleSaveProduct}
        />
      </div>
    </div>
  )
}
