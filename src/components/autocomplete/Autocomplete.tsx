import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import React from "react";

type CustomAutocompleteProps<T> = Omit<
  AutocompleteProps<T, false, false, false>,
  "renderInput" | "onChange"
> & {
  label?: string;
  placeholder?: string;
  onChange?: (value: T | null) => void;
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  renderOption?: AutocompleteProps<T, false, false, false>["renderOption"];
  config?: {
    field?: string;
  };
  handleEdit?: (value: T | null, field?: string) => void;
};

function CustomAutocomplete<T>({
  options,
  label,
  placeholder,
  onChange,
  getOptionLabel,
  isOptionEqualToValue,
  renderOption,
  config,
  handleEdit,
  ...props
}: CustomAutocompleteProps<T>) {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel ?? String}
      isOptionEqualToValue={isOptionEqualToValue}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
        />
      )}
      onChange={(_event, newValue) => {
        if (onChange) {
          onChange(newValue);
        } else if (handleEdit) {
          handleEdit(newValue, config?.field);
        }
      }}
      renderOption={renderOption}
      {...props}
    />
  );
}

export default CustomAutocomplete;
