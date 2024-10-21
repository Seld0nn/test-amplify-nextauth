import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";

const useScreen = () => {
  const theme = useMantineTheme();

  const isUndefinedMediaQuery = useMediaQuery(`(min-width: 1px)`);
  const isXSScreen = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const isSMScreen = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const isMDScreen = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const isLGScreen = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);
  const isXLScreen = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);
  const is2XLScreen = useMediaQuery(`(min-width: 1536px`);
  const [loading, setLoading] = useState(true);
  const [viewInMobile, setViewInMobile] = useState(false);

  useEffect(() => {
    if (loading) {
      if (
        /Android/i.exec(navigator.userAgent) ||
        /webOS/i.exec(navigator.userAgent) ||
        /iPhone/i.exec(navigator.userAgent) ||
        /iPad/i.exec(navigator.userAgent) ||
        /iPod/i.exec(navigator.userAgent) ||
        /BlackBerry/i.exec(navigator.userAgent) ||
        /Windows Phone/i.exec(navigator.userAgent)
      ) {
        setViewInMobile(true);
      } else {
        setViewInMobile(false);
      }

      setLoading(false);
    }
  }, [loading]);

  const screen = {
    isLoading: !isUndefinedMediaQuery && loading,
    viewInMobile: viewInMobile,
    mobile: !isXSScreen,
    xs: isXSScreen,
    sm: isSMScreen,
    md: isMDScreen,
    lg: isLGScreen,
    xl: isXLScreen,
    "2xl": is2XLScreen,
  };

  return screen;
};

export default useScreen;
