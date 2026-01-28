import { ButtonBase, Box, Typography, useTheme, alpha } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface AddWarehouseCardProps {
  readonly onClick: () => void;
}

export default function AddWarehouseCard({ onClick }: AddWarehouseCardProps) {
  const theme = useTheme();

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
        borderRadius: 3,
        border: `2px dashed ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        transition: "all 0.2s",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          "& .icon-circle": {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          },
          "& .title": {
            color: theme.palette.primary.main,
          }
        },
      }}
    >
      <Box
        className="icon-circle"
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: theme.palette.action.hover,
          color: theme.palette.text.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          transition: "all 0.2s",
        }}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h6" fontWeight="medium" className="title" sx={{ transition: "color 0.2s" }} gutterBottom>
        New Location
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
        Register a new warehouse or distribution center to your network.
      </Typography>
    </ButtonBase>
  );
}
