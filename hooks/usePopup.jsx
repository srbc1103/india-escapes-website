import { useState, useCallback } from "react";
import { DialogContainer } from "../components/Dialog";

export default function usePopup({ form = null, container_styles = '',zIndex=99998, allowOverflow=false } = {}) {
  const [isVisible, setIsVisible] = useState(false);

  const showDialog = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setIsVisible(false);
  }, []);

  const dialog = isVisible ? <DialogContainer onClose={hideDialog} containerStyles={container_styles} zIndex={zIndex} allowOverflow={allowOverflow}>{form}</DialogContainer> : null

  return {
    isVisible,
    showDialog,
    hideDialog,
    dialog,
  };
}