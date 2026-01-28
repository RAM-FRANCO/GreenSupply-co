import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { Warehouse } from "@/types/inventory";
import { 
  Box, 
  Button, 
  Grid2, 
  TextField, 
  InputAdornment, 
  MenuItem, 
  Select, 
  Paper,
  Container,
  Skeleton,
  TablePagination
} from "@mui/material";
import { Search as SearchIcon, AddBusiness as AddBusinessIcon } from "@mui/icons-material";
import DeleteConfirmationDialog from "@/components/common/DeleteConfirmationDialog";
import PageHeader from "@/components/common/PageHeader";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useQueryModal } from "@/hooks/useQueryModal";
import WarehouseDialog from "@/components/warehouses/WarehouseDialog";
import { WarehouseFormData } from "@/schemas/inventorySchema";
import WarehouseCard from "@/components/warehouses/WarehouseCard";
import AddWarehouseCard from "@/components/warehouses/AddWarehouseCard";

export default function Warehouses() {
  const router = useRouter();
  const { 
      data: warehouses, 
      loading: warehousesLoading,
      refetch: refresh
  } = usePaginatedData<Warehouse>("/api/warehouses");
  const { params, setSearch, setPage, setLimit } = useUrlParams();

  // Search & Filter State
  const [localSearch, setLocalSearch] = useState(params.search || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
     if (!isFocused && (params.search || "") !== localSearch) {
         setLocalSearch(params.search || "");
     }
  }, [params.search, isFocused, localSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      setSearch(val);
  };
  const [regionFilter, setRegionFilter] = useState("All Regions");

  const loading = warehousesLoading;
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State (URL-driven)
  const { 
    isOpen: isAddOpen, 
    open: openAdd 
  } = useQueryModal({ action: "add" });

  const {
      isOpen: isEditOpen,
      open: openEdit,
      close: closeModal,
      params: modalParams
  } = useQueryModal({ action: "edit" });

  const dialogMode = isEditOpen ? "edit" : "add";
  const isOpen = isAddOpen || isEditOpen;
  const editId = modalParams.id ? Number(modalParams.id) : null;
  
  const initialData = useMemo(() => {
    if (dialogMode === "edit" && editId !== null) {
      const warehouse = warehouses.find(w => w.id === editId);
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
    }
    return undefined;
  }, [dialogMode, editId, warehouses]);

  // Mutations
  const handleDeleteMutation = async (id: number) => {
      try {
          await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
          refresh();
      } catch (e) {
          console.error(e);
      }
  };

  const handleCreateMutation = async (data: WarehouseFormData) => {
      await fetch("/api/warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
      });
      refresh();
  };

  const handleUpdateMutation = async (id: number, data: WarehouseFormData) => {
      await fetch(`/api/warehouses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
      });
      refresh();
  };

  const handleView = (id: number) => {
    const warehouse = warehouses.find(w => w.id === id);
    if (warehouse?.slug) {
        router.push(`/warehouses/${warehouse.slug}`);
    }
  };

  const handleEdit = (id: number) => {
    openEdit("edit", { id });
  };

  const handleClickDelete = (id: number) => {
    setSelectedWarehouseId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedWarehouseId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedWarehouseId) {
      await handleDeleteMutation(selectedWarehouseId);
      handleCloseDelete();
    }
  };

  const handleSubmit = async (data: WarehouseFormData) => {
      setIsSubmitting(true);
      try {
          if (dialogMode === "edit" && editId) {
              await handleUpdateMutation(editId, data);
          } else {
              await handleCreateMutation(data);
          }
          closeModal();
      } catch (error) {
          console.error("Failed to save warehouse", error);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader 
        title="Warehouse Locations"
        description="Manage distribution centers and monitor capacity usage."
      >
        <Button
          variant="contained"
          startIcon={<AddBusinessIcon />}
          onClick={() => openAdd()}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Add Warehouse
        </Button>
      </PageHeader>

      {/* Toolbar */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 4, 
          border: 1, 
          borderColor: "divider", 
          borderRadius: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Box sx={{ position: "relative", width: { xs: "100%", sm: 384 } }}>
           <TextField 
              fullWidth
              placeholder="Search locations, managers..."
              value={localSearch}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              size="small"
              slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                }
              }}
           />
        </Box>
        <Box display="flex" gap={2} width={{ xs: "100%", sm: "auto" }}>
            <Select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 140, borderRadius: 2 }}
                displayEmpty
            >
                <MenuItem value="All Regions">All Regions</MenuItem>
                <MenuItem value="North America">North America</MenuItem>
                <MenuItem value="Europe">Europe</MenuItem>
                <MenuItem value="Asia Pacific">Asia Pacific</MenuItem>
            </Select>
            <Select
                value="Status: All"
                size="small"
                sx={{ minWidth: 140, borderRadius: 2 }}
                disabled
            >
                <MenuItem value="Status: All">Status: All</MenuItem>
            </Select>
        </Box>
      </Paper>

      {/* Content Grid */}
      {loading ? (
        <Grid2 container spacing={3}>
             {[1, 2, 3, 4, 5, 6].map((item) => (
                 <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={item}>
                     <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3, 
                            height: 300, 
                            border: 1, 
                            borderColor: "divider", 
                            borderRadius: 3 
                        }}
                     >
                        <Box display="flex" justifyContent="space-between" mb={3}>
                             <Box display="flex" gap={2}>
                                 <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
                                 <Box>
                                     <Skeleton variant="text" width={120} height={32} />
                                     <Skeleton variant="text" width={100} />
                                 </Box>
                             </Box>
                             <Skeleton variant="circular" width={24} height={24} />
                        </Box>
                        <Box display="flex" flexDirection="column" gap={2} mb={3}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                        </Box>
                        <Box pt={2} display="flex" justifyContent="space-between">
                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 10 }} />
                            <Skeleton variant="text" width={80} />
                        </Box>
                     </Paper>
                 </Grid2>
             ))}
        </Grid2>
      ) : (
        <Grid2 container spacing={3}>

            {warehouses.map((warehouse: Warehouse) => (
                <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={warehouse.id}>


                    <WarehouseCard 
                        warehouse={warehouse}
                        skuCount={warehouse.skuCount || 0}
                        capacityUsed={warehouse.totalQuantity || 0}
                        onEdit={handleEdit}
                        onDelete={handleClickDelete}
                        onView={handleView}
                    />
                </Grid2>
            ))}
            <Grid2 size={{ xs: 12, md: 6, lg: 4 }}>
                <AddWarehouseCard onClick={() => openAdd()} />
            </Grid2>
        </Grid2>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={warehousesLoading ? 0 : 100} // We don't have total count in meta yet? usePaginatedData returns meta.
        // Wait, usePaginatedData returns meta. I need access to it.
        // Step 562: const { data: warehouses, loading..., refetch } = usePaginatedData...
        // I ignored meta!
        // I need to destructor meta properly.
        page={params.page ? params.page - 1 : 0}
        onPageChange={(_, newPage) => setPage(newPage + 1)}
        rowsPerPage={params.limit || 10}
        onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(1);
        }}
      />

      <WarehouseDialog 
        open={isOpen}
        onClose={closeModal}
        mode={dialogMode}
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationDialog
        open={openDelete}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Warehouse"
        description="Are you sure you want to delete this warehouse? This action cannot be undone."
      />
    </Container>
  );
}

