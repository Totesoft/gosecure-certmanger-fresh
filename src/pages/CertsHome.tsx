import { Link } from 'react-router-dom';
import { Button, Label } from '@totesoft/ui-kit';
export default function CertsHome() {
  return (







    <div className="flex justify-center mt-32">
      <div className="flex flex-col gap-4 bg-background dark:bg-background-dark p-6 rounded-lg">
        <Button variant="destructive">
          <Link to="/certs/root">Root CAForm</Link>
        </Button>
        <Button variant="destructive">
          <Link to="/certs/intermediate">Intermediate CAForm</Link>
        </Button>
        <Button variant="destructive">
          <Link to="/certs/user">User CertForm</Link>
        </Button>
        <Button variant="destructive">
          <Link to="/certs/rootca">RootCAdetail</Link>
        </Button>
        <Button variant="destructive">

          <Link to="/certs/testapi">testAPI</Link>
        </Button>
        {/* <Button variant="destructive">
          <Link to="/certs/home">API</Link>
        </Button> */}
        <Button variant="destructive">

          <Link to="/dashboard">Dashboard</Link>
        </Button>

      </div>



    </div>
  );
}
