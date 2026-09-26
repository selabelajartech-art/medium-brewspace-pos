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
  searchQuery,
  setSearchQuery
}) {
  return (
    <div className="h-screen w-screen bg-slate-100 sm:p-4 font-sans text-slate-800 antialiased select-none flex items-center justify-center overflow-hidden">
      <div className="w-full h-full sm:h-[92vh] sm:max-w-7xl bg-white sm:rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden border-0 sm:border sm:border-slate-200">
        
        {/* Navigasi Desktop */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowAdminStaffModal={setShowAdminStaffModal}
          activeCashier={activeCashier}
          showShiftDropdown={showShiftDropdown}
          setShowShiftDropdown={setShowShiftDropdown}
          staffList={staffList}
          setActiveCashier={setActiveCashier}
        />

        {/* Content View Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white h-full min-h-0">
          <Header
            activeCashier={activeCashier}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowAdminStaffModal={setShowAdminStaffModal}
            showShiftDropdown={showShiftDropdown}
            setShowShiftDropdown={setShowShiftDropdown}
          />

          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {children}
          </div>

          {/* Navigasi Mobile Gadget */}
          <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  )
}