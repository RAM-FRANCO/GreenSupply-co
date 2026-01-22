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

  // Map color names to approximate hex values for the background/text logic if needed
  // But for now, relying on simple classes or inline styles if dynamic colors are passed as strings like 'green', 'blue'
  // The layout uses tailwind classes like 'bg-green-50 text-green-600'.
  // We can map 'green' to 'success.light' / 'success.main' or custom palette if available.
  // For simplicity and matching the layout's "theme", we can use a helper or just mapping.

  const getColorStyles = (color: string) => {
    // Basic mapping to MUI standard intent colors or custom ones
    // Using string matching to approximate the layout look
    switch (color) {
      case "green":
        return { bg: "success.light", text: "success.dark" }; // or custom green
      case "blue":
        return { bg: "info.light", text: "info.dark" };
      case "orange":
        return { bg: "warning.light", text: "warning.dark" };
      case "teal":
        return { bg: "#e0f2f1", text: "#00695c" }; // teal-50, teal-800
      case "amber":
        return { bg: "#fff8e1", text: "#ff8f00" }; // amber-50, amber-800
      case "indigo":
        return { bg: "#e8eaf6", text: "#283593" }; // indigo-50, indigo-800
      case "yellow":
        return { bg: "#fffde7", text: "#fbc02d" }; // yellow-50, yellow-700
      case "gray":
        return { bg: "#f5f5f5", text: "#616161" };
      default:
        return { bg: "grey.100", text: "grey.800" };
    }
  };

  const colorStyles = getColorStyles(category.color);

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
        disableScrollLock={true}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
