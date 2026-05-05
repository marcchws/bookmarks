import type { Preview } from "@storybook/react-vite"
import { initialize, mswLoader } from "msw-storybook-addon"
import { handlers } from "../src/mocks/handlers"
import "../src/index.css"

initialize({ onUnhandledRequest: "warn" }, handlers)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
  loaders: [mswLoader],
}

export default preview
