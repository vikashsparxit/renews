import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

interface SettingsProps {
  icon?: React.ReactNode;
}

export const Settings: React.FC<SettingsProps> = ({ icon }) => {
  return (
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon">
        {icon}
      </Button>
    </DialogTrigger>
  );
};