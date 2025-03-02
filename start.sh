#!/bin/bash

# HISecureStay Startup Script
# This script sets up and runs both frontend and backend components of the HISecureStay application

# Set colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${BLUE}===================================================${NC}"
  echo -e "${BLUE}   $1${NC}"
  echo -e "${BLUE}===================================================${NC}\n"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if node_modules exists and is up to date
check_node_modules() {
  local dir=$1
  local package_json="${dir}/package.json"
  local node_modules="${dir}/node_modules"
  
  if [ ! -d "$node_modules" ]; then
    echo -e "${YELLOW}Node modules not found in ${dir}. Installing dependencies...${NC}"
    return 1
  fi
  
  # Check if package.json is newer than node_modules
  if [ "$package_json" -nt "$node_modules" ]; then
    echo -e "${YELLOW}Package.json has been modified since last install in ${dir}. Reinstalling dependencies...${NC}"
    return 1
  fi
  
  echo -e "${GREEN}Dependencies are up to date in ${dir}.${NC}"
  return 0
}

# Check if required tools are installed
check_prerequisites() {
  print_header "Checking Prerequisites"
  
  # Check for Node.js
  if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to continue.${NC}"
    exit 1
  fi
  
  # Check Node.js version
  NODE_VERSION=$(node -v | cut -d 'v' -f 2)
  echo -e "${GREEN}Node.js version ${NODE_VERSION} is installed.${NC}"
  
  # Check for npm
  if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install npm to continue.${NC}"
    exit 1
  fi
  
  # Check for Anchor CLI
  if ! command_exists anchor; then
    echo -e "${YELLOW}Anchor CLI is not installed. Some functionality may be limited.${NC}"
    ANCHOR_INSTALLED=false
  else
    ANCHOR_INSTALLED=true
    echo -e "${GREEN}Anchor CLI is installed.${NC}"
  fi
  
  # Check for Solana CLI
  if ! command_exists solana; then
    echo -e "${YELLOW}Solana CLI is not installed. Some functionality may be limited.${NC}"
  else
    echo -e "${GREEN}Solana CLI is installed.${NC}"
    
    # Check Solana configuration
    if solana config get &>/dev/null; then
      SOLANA_CONFIG=$(solana config get)
      echo -e "${GREEN}Solana configuration:${NC}"
      echo "$SOLANA_CONFIG"
    fi
  fi
}

# Install dependencies for the project
install_dependencies() {
  print_header "Installing Dependencies"
  
  # Frontend dependencies
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  cd "$(dirname "$0")" || exit
  if ! check_node_modules "$(pwd)"; then
    npm install
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install frontend dependencies. Exiting.${NC}"
      exit 1
    fi
    echo -e "${GREEN}Frontend dependencies installed successfully.${NC}"
  fi
  
  # Backend dependencies
  echo -e "${BLUE}Installing backend dependencies...${NC}"
  cd backend || { echo -e "${RED}Backend directory not found. Exiting.${NC}"; exit 1; }
  if ! check_node_modules "$(pwd)"; then
    npm install
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install backend dependencies. Exiting.${NC}"
      exit 1
    fi
    echo -e "${GREEN}Backend dependencies installed successfully.${NC}"
  fi
  
  # Return to root directory
  cd ..
}

# Build Anchor programs if necessary
build_anchor_programs() {
  print_header "Building Anchor Programs"
  
  if [ "$ANCHOR_INSTALLED" = true ]; then
    echo -e "${BLUE}Checking Anchor programs...${NC}"
    
    # Check if build is needed
    if [ ! -d "anchor/target/deploy" ] || [ ! -f "anchor/target/deploy/banking-keypair.json" ]; then
      echo -e "${YELLOW}Anchor programs need to be built.${NC}"
      npm run anchor-build
      
      if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to build Anchor programs. Continuing anyway, but blockchain functionality may be limited.${NC}"
      else
        echo -e "${GREEN}Anchor programs built successfully.${NC}"
      fi
    else
      echo -e "${GREEN}Anchor programs are already built.${NC}"
    fi
  else
    echo -e "${YELLOW}Skipping Anchor build as Anchor CLI is not installed.${NC}"
  fi
}

# Start the backend server
start_backend() {
  print_header "Starting Backend Server"
  
  cd backend || { echo -e "${RED}Backend directory not found. Exiting.${NC}"; exit 1; }
  
  echo -e "${BLUE}Starting backend server on port 3001...${NC}"
  npm run dev &
  BACKEND_PID=$!
  
  echo -e "${GREEN}Backend server started with PID: ${BACKEND_PID}${NC}"
  
  # Wait for backend to start
  echo -e "${YELLOW}Waiting for backend to initialize (5 seconds)...${NC}"
  sleep 5
  
  # Check if backend is still running
  if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}Backend server is running.${NC}"
  else
    echo -e "${RED}Backend server failed to start. Please check the logs.${NC}"
  fi
  
  cd ..
}

# Start the frontend development server
start_frontend() {
  print_header "Starting Frontend Server"
  
  echo -e "${BLUE}Starting frontend development server on port 3000...${NC}"
  npm run dev &
  FRONTEND_PID=$!
  
  echo -e "${GREEN}Frontend server started with PID: ${FRONTEND_PID}${NC}"
  
  # Wait for frontend to start
  echo -e "${YELLOW}Waiting for frontend to initialize (5 seconds)...${NC}"
  sleep 5
  
  # Check if frontend is still running
  if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}Frontend server is running.${NC}"
    echo -e "${GREEN}You can now access the application at: ${BLUE}http://localhost:3000${NC}"
  else
    echo -e "${RED}Frontend server failed to start. Please check the logs.${NC}"
  fi
}

# Setup cleanup function for graceful shutdown
setup_cleanup() {
  cleanup() {
    print_header "Shutting Down Services"
    
    echo -e "${YELLOW}Stopping frontend server (PID: ${FRONTEND_PID})...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    
    echo -e "${YELLOW}Stopping backend server (PID: ${BACKEND_PID})...${NC}"
    kill $BACKEND_PID 2>/dev/null
    
    echo -e "${GREEN}All services have been stopped.${NC}"
    exit 0
  }
  
  # Register the cleanup function for these signals
  trap cleanup SIGINT SIGTERM
}

# Main function to run the script
main() {
  print_header "HISecureStay Application Startup"
  
  # Check prerequisites
  check_prerequisites
  
  # Install dependencies
  install_dependencies
  
  # Build Anchor programs if necessary
  build_anchor_programs
  
  # Start backend server
  start_backend
  
  # Start frontend server
  start_frontend
  
  # Setup cleanup for graceful shutdown
  setup_cleanup
  
  print_header "Startup Complete"
  echo -e "${GREEN}HISecureStay application is now running.${NC}"
  echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
  echo -e "${BLUE}Backend: http://localhost:3001${NC}"
  echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
  
  # Keep the script running to maintain the started processes
  wait
}

# Run the main function
main
