import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface SettingsProps {
  icon?: React.ReactNode;
}

export const Settings: React.FC<SettingsProps> = ({ icon }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          {icon}
        </Button>
      </DialogTrigger>
    </Dialog>
  );
};