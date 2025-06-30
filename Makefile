# Makefile for React TypeScript project
# Default shell
SHELL := /bin/bash

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Variables
NODE_MODULES := node_modules
DIST_DIR := dist
COVERAGE_DIR := coverage

# Default target
.PHONY: help
help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}'

# Installation and setup
.PHONY: install
install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)Dependencies installed successfully!$(NC)"

.PHONY: clean-install
clean-install: clean-deps install ## Clean and reinstall dependencies
	@echo "$(GREEN)Clean installation completed!$(NC)"

# Development
.PHONY: dev
dev: ## Start development server
	@echo "$(YELLOW)Starting development server...$(NC)"
	npm run dev

.PHONY: build
build: ## Build for production
	@echo "$(YELLOW)Building for production...$(NC)"
	npm run build
	@echo "$(GREEN)Build completed! Output in $(DIST_DIR)/$(NC)"

.PHONY: preview
preview: build ## Preview production build
	@echo "$(YELLOW)Starting preview server...$(NC)"
	npm run preview

# Testing
.PHONY: test
test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	npm run test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "$(YELLOW)Running tests in watch mode...$(NC)"
	npm run test:watch

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	npm run test:coverage
	@echo "$(GREEN)Coverage report generated in $(COVERAGE_DIR)/$(NC)"

# Code quality
.PHONY: lint
lint: ## Run ESLint
	@echo "$(YELLOW)Running ESLint...$(NC)"
	npm run lint

.PHONY: lint-fix
lint-fix: ## Run ESLint with auto-fix
	@echo "$(YELLOW)Running ESLint with auto-fix...$(NC)"
	npm run lint -- --fix

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo "$(YELLOW)Running TypeScript type checking...$(NC)"
	npm run typecheck

.PHONY: check
check: typecheck lint test ## Run all checks (typecheck, lint, test)
	@echo "$(GREEN)All checks passed!$(NC)"

# Cleanup
.PHONY: clean
clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf $(DIST_DIR)
	rm -rf $(COVERAGE_DIR)
	@echo "$(GREEN)Cleanup completed!$(NC)"

.PHONY: clean-deps
clean-deps: ## Clean dependencies
	@echo "$(YELLOW)Cleaning dependencies...$(NC)"
	rm -rf $(NODE_MODULES)
	rm -f package-lock.json
	@echo "$(GREEN)Dependencies cleaned!$(NC)"

.PHONY: clean-all
clean-all: clean clean-deps ## Clean everything (build artifacts and dependencies)

# Development workflow
.PHONY: fresh-start
fresh-start: clean-all install ## Complete fresh start (clean everything and reinstall)
	@echo "$(GREEN)Fresh start completed! Ready for development.$(NC)"

.PHONY: ready
ready: install check build ## Prepare project (install, check, build)
	@echo "$(GREEN)Project is ready!$(NC)"

# Information
.PHONY: info
info: ## Show project information
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "  Name: $(shell node -p "require('./package.json').name")"
	@echo "  Version: $(shell node -p "require('./package.json').version")"
	@echo "  Node version: $(shell node --version)"
	@echo "  NPM version: $(shell npm --version)"
	@echo "  Dependencies installed: $(if $(wildcard $(NODE_MODULES)),$(GREEN)Yes$(NC),$(RED)No$(NC))"
	@echo "  Build exists: $(if $(wildcard $(DIST_DIR)),$(GREEN)Yes$(NC),$(RED)No$(NC))"

# Git helpers
.PHONY: git-status
git-status: ## Show git status
	@git status

.PHONY: git-log
git-log: ## Show recent git commits
	@git log --oneline -10