import { Link } from 'react-router-dom';
import { Button, Label } from '@totesoft/ui-kit';
export default function CertsHome() {
  return (







    <div className="flex justify-center mt-32">
      <div className="flex flex-col gap-4 bg-background dark:bg-background-dark p-6 rounded-lg">

        <Button variant="destructive">

          <Link to="/certs/testapi">TestAPI</Link>
        </Button>

        <Button variant="destructive">

          <Link to="/certdashboard">UserCertmanager</Link>
        </Button>
        <Button variant="destructive">
          <Link to="/vpndashboard">VPNDashboard</Link>

        </Button>

      </div>



    </div>
  );
}
