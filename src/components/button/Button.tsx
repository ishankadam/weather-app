import { Button, ButtonProps } from "@mui/material";
import React from "react";

type CustomButtonProps = ButtonProps & {
  fullWidth?: boolean;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "contained",
  color = "primary",
  children,
  className = "",
  sx = {},
  fullWidth = true,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      className={className}
      fullWidth={fullWidth}
      sx={{
        borderRadius: "12px",
        textTransform: "none",
        padding: "12px",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
