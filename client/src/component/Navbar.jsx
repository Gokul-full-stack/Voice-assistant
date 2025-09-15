import React from "react";
import VoiceToText from "./VoiceToText";
import { ChartNoAxesCombined, ClipboardClock } from "lucide-react";
import { BsFillFileEarmarkBarGraphFill, BsTools } from "react-icons/bs";
import { FaMapMarkedAlt } from "react-icons/fa";
import { MdOutlineReplayCircleFilled } from "react-icons/md";
import { IoIosPlayCircle, IoMdHelpCircle } from "react-icons/io";
import { PiMapPinAreaFill } from "react-icons/pi";
import { GoAlertFill, GoBellFill } from "react-icons/go";

function Navbar({ onCommand }) {
  const navItems = [
    { icon: FaMapMarkedAlt, label: "Live Map" },
    { icon: BsFillFileEarmarkBarGraphFill, label: "Reports" },
    { icon: MdOutlineReplayCircleFilled, label: "Replay" },
    { icon: IoIosPlayCircle, label: "Videos" },
    { icon: PiMapPinAreaFill, label: "Places" },
    { icon: GoAlertFill, label: "Alerts" },
    { icon: ChartNoAxesCombined, label: "Dashboard" },
    { icon: BsTools, label: "Maintenance" },
    { icon: ClipboardClock, label: "Log book" },
  ];

  return (
    <div className="w-full bg-gray-100 text-black flex items-center justify-between px-4 py-2 shadow-md">
      {/* Left Logo Section */}
      <div className="flex flex-row gap-4 items-center">
        <div className="flex flex-col leading-tight">
          <h1 className="text-xl md:text-2xl font-bold">verizon</h1>
          <p className="ml-8 text-sm md:text-md">Connect</p>
        </div>

        <div className="flex flex-col leading-tight">
          <h1 className="text-lg md:text-xl font-bold">Reveal</h1>
          <p className="ml-9 text-xs md:text-sm font-bold">Pro</p>
        </div>
      </div>

      {/* Center Navigation */}
      <div className="hidden md:flex gap-3 flex-wrap justify-center">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center hover:text-yellow-400 cursor-pointer p-3"
            >
              <Icon size={20} />
              <span className="font-bold text-xs">{item.label}</span>
            </div>
          );
        })}
        <div className="flex flex-col items-center gap-1">
              <VoiceToText onCommand={onCommand} />
              <span className="font-bold text-xs">Voice</span>
  </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Bell Icon */}
        <GoBellFill size={23} className="text-gray-700" />

        {/* Help Section */}
        <div className="flex flex-col items-center justify-center">
          <IoMdHelpCircle size={18} />
          <span className="text-xs font-semibold">Help</span>
        </div>

        {/* Circle with Text */}
        <div className="w-8 h-8 flex items-center justify-center border rounded-full">
          <span className="text-sm font-bold">A</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
