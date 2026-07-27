import type { Metadata } from "next";
import styles from "./studio.module.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={styles.studioRoute}>{children}</div>;
}
