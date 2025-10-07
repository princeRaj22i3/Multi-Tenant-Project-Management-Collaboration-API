'use client'
import React from 'react';
import './org.css'
import Link from 'next/link';
import { useState } from 'react';

export const Card: React.FC = () => {
    return (
        <div className='cardOrg'>
            <div className='backgroundOrg'></div>
            <div className='pfpOrg'></div>
            <div className='infoOrg'>
                <div className='orgName'>Eternity</div>
                <div className='orgAbout'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam harum vel molestias perspiciatis!</div>
            </div>
        </div>
    )
}

export const CreateOrg:React.FC = () => {
    const timestamp = Date.now();
    const date = new Date(timestamp)
    const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
    const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    return(
        <div>
            <div>Last login: {day[date.getDay()]} {month[date.getMonth()]} {date.getDate()} {date.getHours()}:{date.getMinutes()}:{date.getSeconds()}</div>
            <div>{}</div>
        </div>
    )
}

const Org: React.FC = () => {
    const [create,isCreate] = useState<boolean>(false); 
    const [popUpcreateOrg, setpopUpcreateOrg] = useState<boolean>(true)
    return (
        <div className='orgBody'>
            {popUpcreateOrg&& <div className='createPopUpDiv'><CreateOrg/></div>}

            <div className='discoverOrg'>
                <div className='discoverOrgHeader'>Discover</div>
                <div className='discoverOrgParams coteriesOrg' onMouseEnter={()=>{isCreate(true)}} onMouseLeave={()=>isCreate(false)}>
                    <Link href='http://localhost:3000/discover/coterie'>Coteries</Link>
                    {create && <div style={{fontWeight:'100', fontSize:'30px', cursor:'pointer'}} onClick={()=>{setpopUpcreateOrg(true)}}>+</div>}
                </div>
                <div className='discoverOrgParams'><Link href='http://localhost:3000/discover/associates'>Associates</Link></div>
            </div>

            <div className='orgMainContainer'>

                <div className='headerDivOrg'>
                    <div className='navOrg'>
                        <div style={{ display: 'flex', justifyContent: 'space-around', width: '55%' }}>
                            <div>Home</div>
                            <div>Gaming</div>
                            <div>Music</div>
                            <div>Entertainment</div>
                            <div>Science & Tech</div>
                            <div>Coding</div>
                        </div>
                        <div><input className='headerInputOrg' type="text" placeholder='Search your Organisation' /></div>
                    </div>
                    <div className='headerDivOrgfoot'>
                        <h2>FIND YOUR COTERIE</h2>
                        <div style={{ fontSize: '18px', fontWeight: '200' }}>From gaming, to music, to learning, there's a place for you</div>
                    </div>
                </div>

                <div className='cardContainerOrg'>
                    <Card />
                </div>

            </div>
        </div>
    )
}

export default Org