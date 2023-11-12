import { Link, useMatch, useResolvedPath } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className='nav'>
      <Link to='/' className='site-title'>
        FishFind
      </Link>
      <ul>
        <CustomLink to='/map'>Mapa</CustomLink>
        <CustomLink to='/chat'>Czat</CustomLink>
        <CustomLink to='/account'>Konto</CustomLink>
      </ul>
    </nav>
  );
};

const CustomLink = ({ to, children, ...props }) => {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? 'active' : ''}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
};

export default Navbar;
