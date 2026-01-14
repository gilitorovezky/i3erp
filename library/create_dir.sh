#!/bin/bash

# Check if both parameters are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <path> <filename>"
    exit 1
fi

# Assign parameters to variables
PATH_DIR="$1"
FILENAME="$2"

# Check if the file exists
if [ ! -f "$FILENAME" ]; then
    echo "Error: File '$FILENAME' does not exist"
    exit 1
fi

# Check if the path exists
if [ ! -d "$PATH_DIR" ]; then
    echo "Error: Path '$PATH_DIR' does not exist"
    exit 1
fi

# Read the file line by line and display directories
while IFS= read -r line; do
    # Skip empty lines
    if [ -z "$line" ]; then
        continue
    fi
    
    # Remove leading/trailing whitespace
    DIR_NAME=$(echo "$line" | xargs)
    
    # Display the directory that would be created
    NEW_DIR="$PATH_DIR/$DIR_NAME"
    #echo "$NEW_DIR"
    if [ -d "$NEW_DIR" ]; then
        echo "Directory already exists, skipping: $NEW_DIR"
        continue
    fi
    
    # Create the directory
     mkdir -p "$NEW_DIR"
    
    # Check if directory was created successfully
     if [ $? -eq 0 ]; then
         echo "Directory created successfully: $NEW_DIR"
     else
         echo "Error: Failed to create directory: $NEW_DIR"
     fi
done < "$FILENAME"

echo "All directories displayed."