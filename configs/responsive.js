import {
  widthPercentageToDP,
  heightPercentageToDP,
} from "react-native-responsive-screen";

// Reference design dimensions (iPhone X / 11). Sizes used in stylesheets are
// expressed in pixels relative to this baseline so they scale proportionally
// across devices.
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Width-based responsive size (use for horizontal paddings/margins, widths,
// border-radius, gaps, icon sizes).
export const rw = (size) => widthPercentageToDP((size / BASE_WIDTH) * 100);

// Height-based responsive size (use for vertical paddings/margins, heights).
export const rh = (size) => heightPercentageToDP((size / BASE_HEIGHT) * 100);

// Font scaling — based on width so text grows/shrinks consistently with the UI.
export const rf = (size) => widthPercentageToDP((size / BASE_WIDTH) * 100);
