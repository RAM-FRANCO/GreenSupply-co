import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { 
    Box, 
    Container, 
    Grid2, 
    Paper, 
    Typography, 
    Button, 
    Chip, 
    Avatar,
    LinearProgress, 
    TextField,
    InputAdornment,
    useTheme,
    alpha,
    Skeleton
} from "@mui/material";
import { 
    Search,
    EditLocation,
    LocalShipping,
    Place,
    Person,
    Call
} from "@mui/icons-material";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useInventoryData, EnrichedStock } from "@/hooks/useInventoryData";
import { customPalette } from "@/theme/theme";
import DataTable from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQueryModal } from "@/hooks/useQueryModal";
import WarehouseDialog from "@/components/warehouses/WarehouseDialog";
import { WarehouseFormData } from "@/schemas/inventorySchema";

export default function WarehouseDetails() {
    const router = useRouter();
    const { slug } = router.query;
    const theme = useTheme();
    const { warehouses, loading: warehousesLoading, updateWarehouse } = useWarehouses();
    const { enrichedStock, categories, loading: stockLoading } = useInventoryData();
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal Logic
    const {
        isOpen: isEditOpen,
        open: openEdit,
        close: closeModal
    } = useQueryModal({ action: "edit" });

    // Find Warehouse by Slug
    const warehouse = useMemo(() => {
        if (!slug || !warehouses) return null;
        return warehouses.find(w => w.slug === slug);
    }, [slug, warehouses]);

    const initialData = useMemo(() => {
        if (warehouse) {
            return {
                name: warehouse.name,
                location: warehouse.location,
                code: warehouse.code,
                managerName: warehouse.managerName,
                type: warehouse.type,
                maxSlots: warehouse.maxSlots
            };
        }
        return undefined;
    }, [warehouse]);

    const handleEditClick = () => {
        if (warehouse) {
            openEdit("edit", { id: warehouse.id });
        }
    };

    const handleEditSubmit = async (data: WarehouseFormData) => {
        if (!warehouse) return;
        setIsSubmitting(true);
        try {
            await updateWarehouse(warehouse.id, data);
            closeModal();
        } catch (error) {
            console.error("Failed to update warehouse", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter Stock for this Warehouse
    const warehouseStock = useMemo(() => {
        if (!enrichedStock || !warehouse) return [];
        return enrichedStock.filter(item => item.warehouseId === warehouse.id);
    }, [enrichedStock, warehouse]);

    // Stats Calculations
    const stats = useMemo(() => {
        if (!warehouse || !warehouseStock) return null;

        const totalQuantity = warehouseStock.reduce((acc, item) => acc + item.quantity, 0);
        const maxSlots = warehouse.maxSlots || 500;
        
        const capacityUsed = totalQuantity; 
        const capacityPercentage = Math.min(Math.round((capacityUsed / maxSlots) * 100), 100);

        // Category breakdown
        const categoryCounts: Record<string, number> = {};
        warehouseStock.forEach(item => {
            const catId = item.product?.categoryId;
            const catName = categories.find(c => c.id === catId)?.name || "Uncategorized";
            categoryCounts[catName] = (categoryCounts[catName] || 0) + item.quantity;
        });

        // Map category names to colors using categories data
        const getCategoryColor = (name: string) => {
             const cat = categories.find(c => c.name === name);
             // Return generic hex colors or theme palette lookups
             if (cat?.color) {
                 switch(cat.color) {
                     case 'green': return theme.palette.success.main;
                     case 'blue': return theme.palette.info.main;
                     case 'purple': return "#9c27b0";
                     case 'amber': 
                     case 'orange': return theme.palette.warning.main;
                     case 'teal':  return "#009688";
                     case 'indigo': return "#3f51b5";
                     default: return theme.palette.primary.main;
                 }
             }
             return theme.palette.primary.main;
        };

        const sortedCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4) // Top 4
            .map(([name, qty]) => ({
                name,
                percentage: Math.round((qty / totalQuantity) * 100),
                color: getCategoryColor(name),
                quantity: qty
            }));

        return {
            totalQuantity,
            maxSlots,
            capacityPercentage,
            sortedCategories,
            available: maxSlots - capacityUsed
        };

    }, [warehouse, warehouseStock, categories, theme]);


    const filteredStock = useMemo(() => {
        if (!searchTerm) return warehouseStock;
        const lowerTerm = searchTerm.toLowerCase();
        return warehouseStock.filter(item => 
            item.product?.name.toLowerCase().includes(lowerTerm) || 
            item.product?.sku.toLowerCase().includes(lowerTerm)
        );
    }, [warehouseStock, searchTerm]);

    const columns = useMemo<ColumnDef<EnrichedStock>[]>(
        () => [
            {
                accessorFn: (row) => row.product?.sku || "N/A",
                id: "sku",
                header: "SKU",
                cell: (info) => (
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                        {info.getValue() as string}
                    </Typography>
                ),
            },
            {
                accessorFn: (row) => row.product?.name || "Unknown",
                id: "name",
                header: "Product Name",
                cell: (info) => (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                            variant="rounded" 
                            src={undefined} // Placeholder for product image if available
                            sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: 14, fontWeight: 'bold' }}
                        >
                            {(info.getValue() as string).substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>{info.getValue() as string}</Typography>
                    </Box>
                )
            },
            {
                accessorFn: (row) => {
                    const catId = row.product?.categoryId;
                    return categories.find(c => c.id === catId)?.name || "Uncategorized";
                },
                id: "category",
                header: "Category",
                cell: (info) => (
                    <Typography variant="body2" color="text.secondary">
                        {info.getValue() as string}
                    </Typography>
                )
            },
            {
                accessorKey: "quantity",
                header: "Quantity",
                meta: { align: "right" },
                cell: (info) => (
                    <Typography variant="body2" fontWeight={600}>
                         {(info.getValue() as number).toLocaleString()}
                    </Typography>
                )
            },
            {
                id: "status",
                header: "Status",
                meta: { align: "center" },
                accessorFn: (row) => {
                     if (!row.product) return "Unknown";
                     return row.quantity <= row.product.reorderPoint ? "Low Stock" : "In Stock";
                },
                cell: (info) => {
                    const status = info.getValue() as string;
                    const isLowStock = status === "Low Stock";
                    return (
                        <Chip 
                            label={status}
                            size="small"
                            sx={{ 
                                bgcolor: isLowStock ? customPalette.status.lowStock.bg : customPalette.status.inStock.bg,
                                color: isLowStock ? customPalette.status.lowStock.text : customPalette.status.inStock.text,
                                fontWeight: 600,
                                fontSize: '0.75rem'
                            }}
                        />
                    );
                }
            }
        ],
        [theme, categories]
    );

    // Initial Loading State
    if (warehousesLoading || stockLoading) {
        return (
             <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Skeleton */}
                <Paper sx={{ p: 4, mb: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                     <Box display="flex" flexDirection="column" gap={2}>
                        <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={400} height={60} />
                        <Box display="flex" gap={3}>
                            <Skeleton variant="text" width={150} />
                            <Skeleton variant="text" width={150} />
                            <Skeleton variant="text" width={150} />
                        </Box>
                     </Box>
                </Paper>

                {/* Stats Skeleton */}
                <Grid2 container spacing={3} sx={{ mb: 4 }}>
                    {[1, 2, 3].map((item) => (
                        <Grid2 size={{ xs: 12, md: 4 }} key={item}>
                             <Paper sx={{ p: 3, height: 300, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
                             </Paper>
                        </Grid2>
                    ))}
                </Grid2>

                {/* Table Skeleton */}
                <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                    <Box display="flex" justifyContent="space-between" mb={3}>
                        <Skeleton variant="rectangular" width={200} height={32} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: 1 }} />
                    </Box>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <Box key={item} display="flex" gap={2} my={2}>
                            <Skeleton variant="text" width="100%" height={40} />
                        </Box>
                    ))}
                </Paper>
             </Container>
        )
    }

    if (!warehouse) {
         return (
             <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography>Warehouse not found.</Typography>
             </Container>
        )
    }

    // Gauge calculations
    const capacityColor = stats && stats.capacityPercentage >= 90 ? theme.palette.error.main : theme.palette.success.main;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = stats ? circumference - (stats.capacityPercentage / 100) * circumference : 0;


    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                    <Box>
                         <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Chip label="Operational" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 600 }} />
                            <Typography variant="h4" fontWeight={700} component="h1">
                                {warehouse.name}
                            </Typography>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
                            <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                <Place fontSize="small" />
                                <Typography variant="body2">{warehouse.location}</Typography>
                            </Box>
                             <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                <Person fontSize="small" />
                                <Typography variant="body2">Manager: {warehouse.managerName || "Unassigned"}</Typography>
                            </Box>
                             <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                                <Call fontSize="small" />
                                <Typography variant="body2">+1 (206) 555-0199</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Stats Grid */}
            {stats && (
                <Grid2 container spacing={3} sx={{ mb: 4 }}>
                    {/* Capacity Utilization */}
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                            <Typography variant="h6" fontWeight={600} gutterBottom alignSelf="flex-start" color="text.primary">Capacity Utilization</Typography>
                            
                            <Box position="relative" width={160} height={160} display="flex" alignItems="center" justifyContent="center">
                                <Box 
                                    component="svg"
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 100 100"
                                    sx={{ transform: "rotate(-90deg)" }}
                                >
                                    {/* Track */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        fill="transparent"
                                        stroke={theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]}
                                        strokeWidth="8"
                                    />
                                    {/* Value */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        fill="transparent"
                                        stroke={capacityColor}
                                        strokeWidth="8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        // Simple animation
                                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                    />
                                </Box>
                                <Box
                                    position="absolute"
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                >
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.capacityPercentage}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Full
                                    </Typography>
                                </Box>
                            </Box>

                            <Box width="100%" mt={3} textAlign="center">
                                <Typography variant="body2" color="text.secondary">Total Capacity: <Box component="span" fontWeight={600} color="text.primary">{stats.maxSlots.toLocaleString()} Units</Box></Typography>
                                <Typography variant="body2" color="text.secondary">Available Space: <Box component="span" fontWeight={600} color="success.main">{stats.available.toLocaleString()} Units</Box></Typography>
                            </Box>
                        </Paper>
                    </Grid2>

                    {/* Top Categories */}
                    <Grid2 size={{ xs: 12, md: 4 }}>
                         <Paper sx={{ p: 3, height: '100%', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                             <Typography variant="h6" fontWeight={600} gutterBottom mb={3}>Top Categories in this Location</Typography>
                             <Box display="flex" flexDirection="column" gap={3}>
                                {stats.sortedCategories.map((cat) => (
                                    <Box key={cat.name}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>{cat.name}</Typography>
                                            <Typography variant="body2" fontWeight={600}>{cat.percentage}%</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={cat.percentage} 
                                            sx={{ 
                                                height: 10, 
                                                borderRadius: 5,
                                                bgcolor: alpha(cat.color, 0.2),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: cat.color,
                                                    borderRadius: 5
                                                }
                                            }}
                                        />
                                    </Box>
                                ))}
                             </Box>
                        </Paper>
                    </Grid2>

                    {/* Warehouse Actions */}
                     <Grid2 size={{ xs: 12, md: 4 }}>
                         <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                             <Typography variant="h6" fontWeight={600} gutterBottom mb={3}>Warehouse Actions</Typography>
                             
                             <Box display="flex" flexDirection="column" gap={2} flex={1}>
                                <Button 
                                    variant="outlined" 
                                    size="large" 
                                    startIcon={<EditLocation />}
                                    onClick={handleEditClick}
                                    sx={{ justifyContent: 'center', py: 1.5, borderColor: theme.palette.divider, color: 'text.primary', "&:hover": { bgcolor: theme.palette.action.hover } }}
                                >
                                    Edit Warehouse
                                </Button>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    color="primary"
                                    startIcon={<LocalShipping />}
                                    sx={{ justifyContent: 'center', py: 1.5 }}
                                    onClick={() => router.push(`/transfers?fromWarehouseId=${warehouse.id}`)}
                                >
                                    Transfer Stock
                                </Button>
                              
                             </Box>

                         
                        </Paper>
                    </Grid2>
                </Grid2>
            )}

            {/* DataTable */}
            <DataTable
                title="Stored Items"
                data={filteredStock}
                columns={columns}
                isLoading={stockLoading || warehousesLoading}
                emptyMessage="No items found in this warehouse."
                headerActions={
                    <TextField
                        size="small"
                        placeholder="Search SKU or Product Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                }
            />

            <WarehouseDialog 
                open={isEditOpen}
                onClose={closeModal}
                mode="edit"
                initialData={initialData}
                onSubmit={handleEditSubmit}
                isSubmitting={isSubmitting}
            />
        </Container>
    );
}
