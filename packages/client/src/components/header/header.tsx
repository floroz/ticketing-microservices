"use client";

import Link from 'next/link';
import styles from './header.module.css';
import { useUser } from "@/context/user";

export default function Header() {
  const { user } = useUser();

  return (
    <div className={styles.header}>
      <ul className={styles.links}>
        <li>
          <Link href="/">
            Home
          </Link>
        </li>
        {!user ? (
          <>
            <li>
              <Link href="/signup">
                Signup
              </Link>
            </li>
            <li>
              <Link href="/signin">
                Signin
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/welcome">
                Welcome {user?.email}
              </Link>
            </li>
            <li>
              <Link href="/signout">
                Signout
              </Link>
            </li></>
        )}
      </ul>
    </div>
  );
}