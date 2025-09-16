import { Link } from "react-router-dom";
import { Button } from "@totesoft/ui-kit";


export default function Dashboard() {
    
return (
    <div className="p-4">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-gray-600">This is a placeholder for dashboard content.</p>
        <p className="text-gray-600">You can add charts, stats, and other relevant information here.</p>
        <div className="mt-4 space-x-2">
            <Button variant="destructive" size={'lg'} ><Link to={"/"}>Get Started</Link></Button>
            <Button variant="destructive" size={'lg'} ><Link to={"/ovpn"}>OVPN</Link></Button>
            <Button variant="destructive" size={'lg'} ><Link to={"/root"}>Root CA</Link></Button>
        </div> 
        
        <br/>


        
    </div>
)

}
