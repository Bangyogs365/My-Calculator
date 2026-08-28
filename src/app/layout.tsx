import type { Metadata, Viewport } from "next";
import "./globals.css";


export const metadata: Metadata = {

  title: "My Calculator",

  description:
    "Modern calculator application",

  applicationName:
    "My Calculator",

  manifest:
    "/manifest.json",

  icons: {

    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },

      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],


    apple:
      "/icons/apple-touch-icon.png",
  },


};


export const viewport: Viewport = {

  width: "device-width",

  initialScale: 1,

  maximumScale: 1,

  userScalable: false,

  themeColor: "#071A3D",

};



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {


  return (

    <html lang="en">

      <body>

        {children}

      </body>

    </html>

  );

}
