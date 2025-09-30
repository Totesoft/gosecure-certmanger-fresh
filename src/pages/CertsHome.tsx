import { Link } from 'react-router-dom';
import { Button, Label } from '@totesoft/ui-kit';

export default function CertsHome() {
  return (

    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Certificates</h2>
      <p className="text-gray-600">
        Manage, issue, rotate, and monitor certificates.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Expiring soon</div>
          <div className="text-3xl font-semibold">12</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Total certs</div>
          <div className="text-3xl font-semibold">438</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Issuers</div>
          <div className="text-3xl font-semibold">6</div>
        </div>
        <div>
          <Label >Filter</Label>
        </div>
        <div className="grid grid-cols-1 space-y-2 ">
          <Button className='bg-blue-200'  >Help</Button>
          <Button variant={'outline'} className='bg-primary'  ><Link to={"/dashboard"}>Dashboard</Link></Button>
          <Button className='bg-indigo-300'   ><Link to={"/ovpn"}>Ovpn Generator</Link></Button>
          <Button variant={'destructive'} ><Link to={"/root"}>Root CA</Link></Button>
        </div>
      </div>





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

        </div>



      </div>
    </div>
  );
}
