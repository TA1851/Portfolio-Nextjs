import React from "react";
import HeaderComp from "./demo/header";
import Footer from "./demo/footer";
import Body from "./demo/body";


export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen bg-white"
    >
      <HeaderComp />
      <main
        className="flex-grow bg-white"
      >
        <Body />
      </main>
      <Footer />
    </div>
  );
}
