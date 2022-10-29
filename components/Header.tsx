import Link from "next/link";

function Header() {
  return (
    <header>
      <div>
        <Link href="/">
          <img
            className="w-44 object-contain cursor-pointer"
            src="https://links.papareact.com/yvf"
            alt="medium logo"
          />
        </Link>
        <div>
          <h3>About</h3>
          <h3>Contact</h3>
          <h3>Follow</h3>
        </div>
      </div>
      <div></div>
    </header>
  );
}

export default Header;
