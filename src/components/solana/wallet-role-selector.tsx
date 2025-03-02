'use client';

import { useRef, useEffect } from 'react';
import { useAppWallet } from '@/context/WalletContext';

// Make sure external CSS is overridden for proper integration
const style = `
.wallet-adapter-dropdown-list {
  grid-template-rows: auto auto auto auto !important;
}
`;

export default function RoleSelector({ children }: { children: React.ReactNode }) {
  const { walletType, setWalletType, isConnected } = useAppWallet();
  const menuRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    if (!isConnected) return;

    // Function to inject our role selector items into the wallet dropdown
    const injectRoleSelectorItems = () => {
      const dropdown = document.querySelector('.wallet-adapter-dropdown-list') as HTMLUListElement;
      if (!dropdown) return;
      
      // First, clean up any existing role items to prevent duplicates
      const existingItems = dropdown.querySelectorAll('.wallet-role-item');
      existingItems.forEach(item => item.remove());
      
      // Create owner role item with a unique class
      const ownerItem = document.createElement('li');
      ownerItem.className = 'wallet-adapter-dropdown-list-item wallet-role-item';
      ownerItem.textContent = `${walletType === 'owner' ? '✓ ' : ''}Property Owner Mode`;
      ownerItem.addEventListener('click', () => setWalletType('owner'));

      // Create tenant role item with a unique class
      const tenantItem = document.createElement('li');
      tenantItem.className = 'wallet-adapter-dropdown-list-item wallet-role-item';
      tenantItem.textContent = `${walletType === 'tenant' ? '✓ ' : ''}Tenant Mode`;
      tenantItem.addEventListener('click', () => setWalletType('tenant'));
      
      // Create a separator
      const separator = document.createElement('li');
      separator.className = 'wallet-adapter-dropdown-list-item wallet-role-item';
      separator.style.borderTop = '1px solid rgba(255,255,255,0.1)';
      separator.style.margin = '4px 0';
      separator.style.padding = '0';
      separator.style.height = '1px';

      // Add the items before the disconnect option
      const disconnectItem = dropdown.querySelector('.wallet-adapter-dropdown-list-item:last-child');
      if (disconnectItem) {
        dropdown.insertBefore(separator, disconnectItem);
        dropdown.insertBefore(ownerItem, separator);
        dropdown.insertBefore(tenantItem, separator);
      } else {
        dropdown.appendChild(ownerItem);
        dropdown.appendChild(tenantItem);
        dropdown.appendChild(separator);
      }
    };

    // Monitor for dropdown becoming active
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'class' && 
            (mutation.target as HTMLElement).classList.contains('wallet-adapter-dropdown-list-active')) {
          injectRoleSelectorItems();
        }
      });
    });

    // Find dropdown list to observe
    const dropdownList = document.querySelector('.wallet-adapter-dropdown-list');
    if (dropdownList) {
      observer.observe(dropdownList, { attributes: true });
    }

    return () => {
      observer.disconnect();
    };
  }, [isConnected, walletType, setWalletType]);

  return (
    <>
      <style>{style}</style>
      {children}
    </>
  );
}