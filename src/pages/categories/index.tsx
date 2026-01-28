import { useState } from "react";
import {
  Box,
  Button,
  Grid2,
  Alert,
  Fade,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryCard from "@/components/categories/CategoryCard";
import CategoryModal from "@/components/categories/CategoryModal";
import DeleteCategoryDialog from "@/components/categories/DeleteCategoryDialog";
import { Category } from "@/types/category";
import { CategoryFormData } from "@/schemas/category";
import { useCategories } from "@/hooks/useCategories";
import PageHeader from "@/components/common/PageHeader";
import { useQueryModal } from "@/hooks/useQueryModal";

export default function CategoriesPage() {
  const { 
    categories, 
    loading, 
    error, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    isMutating 
  } = useCategories();

  // Modal State (URL-driven)
  // We use useQueryModal only for managing the 'action' query param
  const { 
    isOpen: isAddOpen, 
    open: openAdd 
  } = useQueryModal({ action: "add" });

  const {
      isOpen: isEditOpen,
      open: openEdit,
      close: closeModal,
      params
  } = useQueryModal({ action: "edit" });

  const isModalOpen = isAddOpen || isEditOpen;
  const editingId = params.id ? String(params.id) : null;

  // Derived state from URL
  const editingCategory = editingId 
    ? categories.find(c => c.id === editingId) || null
    : null;

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleAddClick = () => {
    openAdd();
  };

  const handleEditClick = (category: Category) => {
    openEdit("edit", { id: category.id });
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleModalSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data });
      } else {
        // We cast to any here because createCategory expects Omit<Category, "id">
        // but CategoryFormData is missing the derived fields.
        // The API now handles these defaults, so this is safe at runtime.
        await createCategory({ ...data, productCount: 0, totalItems: 0, totalValue: 0 } as Omit<Category, "id">);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      // Hook handles error state, but we might want a toast here
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (

      <Box sx={{p:1}}>
      <PageHeader
        title="Product Categories"
        description="Manage your product categories and view stock distribution."
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{ px: 3, py: 1.5, borderRadius: 2 }}
        >
          Add Category
        </Button>
      </PageHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid2 container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Skeleton
                      variant="rounded"
                      width={64}
                      height={64}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Skeleton variant="text" width={60} height={16} />
                      <Skeleton variant="text" width={40} height={32} />
                    </Box>
                    <Box sx={{ textAlign: "right", display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Skeleton variant="text" width={50} height={16} />
                      <Skeleton variant="text" width={60} height={32} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <Fade in>
          <Grid2 container spacing={2}>
            {categories.map((category) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={category.id}>
                <CategoryCard
                  category={category}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </Grid2>
            ))}
          </Grid2>
        </Fade>
      )}

      <CategoryModal
        open={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        loading={isMutating}
      />

      {categoryToDelete && (
        <DeleteCategoryDialog
          open={isDeleteDialogOpen}
          categoryName={categoryToDelete.name}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          loading={isMutating}
        />
      )}
      </Box>
  );
}
