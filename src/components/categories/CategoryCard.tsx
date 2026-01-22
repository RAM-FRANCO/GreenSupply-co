import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Icon,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { Category } from "@/types/category";
import { getCategoryColor } from "@/utils/categoryColors";

interface CategoryCardProps {
  readonly category: Category;
  readonly onEdit: (category: Category) => void;
  readonly onDelete: (category: Category) => void;
}

export default function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleCloseMenu();
    onEdit(category);
  };

  const handleDelete = () => {
    handleCloseMenu();
    onDelete(category);
  };

  const colorStyles = getCategoryColor(category.name);

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderColor: "primary.light",
          transform: anchorEl ? "none" : "translateY(-2px)",
        },
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
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: colorStyles.bg, // Using background prop for non-standard colors
              color: colorStyles.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Requires Material Icons font to be loaded */}
            <Icon fontSize="large">{category.icon}</Icon>
          </Box>
          <IconButton
            size="small"
            onClick={handleOpenMenu}
            sx={{ color: "text.disabled" }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            {category.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {category.productCount} Products
          </Typography>
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
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="bold"
              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              Total Items
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {category.totalItems.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="bold"
              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              Value
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              ${category.totalValue.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
