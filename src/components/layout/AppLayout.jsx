import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'

export default function AppLayout({
  children,
  activeTab,
  setActiveTab,
  activeCashier,
  setActiveCashier,
  staffList,
  setStaffList,
  showShiftDropdown,
  setShowShiftDropdown,
  setShowAdminStaffModal,
  setShowShiftClosingModal,
  searchQuery,
  setSearchQuery,
  isManagerOrAdmin,
  lockTerminal
}) {
  return (
    <div className="h-screen w-screen bg-slate-100 sm:p-4 font-sans text-slate-800 antialiased select-none flex items-center justify-center overflow-hidden">
      <div className="w-full h-full sm:h-[94vh] sm:max-w-7xl bg-white sm:rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border-0 sm:border sm:border-slate-200/80">
        
        {/* Sidebar Navigasi Kiri */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowAdminStaffModal={setShowAdminStaffModal}
          activeCashier={activeCashier}
          showShiftDropdown={showShiftDropdown}
          setShowShiftDropdown={setShowShiftDropdown}
          staffList={staffList}
          setActiveCashier={setActiveCashier}
          isManagerOrAdmin={isManagerOrAdmin}
          lockTerminal={lockTerminal}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white h-full min-h-0">
          <Header
            activeCashier={activeCashier}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowAdminStaffModal={setShowAdminStaffModal}
            showShiftDropdown={showShiftDropdown}
            setShowShiftDropdown={setShowShiftDropdown}
            setShowShiftClosingModal={setShowShiftClosingModal}
            isManagerOrAdmin={isManagerOrAdmin}
            lockTerminal={lockTerminal}
          />

          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {children}
          </div>

          {/* Bottom Nav Mobile */}
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isManagerOrAdmin={isManagerOrAdmin}
          />
        </div>
      </div>
    </div>
  )
}