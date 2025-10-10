import { createTheme } from "@u_ui/u-ui";

const theme = {
  dark: createTheme({
    palette: {
      mode: "dark"
    },
    components: {
      uiAvatar: {
        styleOverrides: {
          root: {
            color: '#fff',
            background: "#444"
          }
        }
      },
      uiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          }
        }
      }
    }
  }),
  light: createTheme({
    palette: {
      mode: "light"
    }
  })
}

export default theme;
