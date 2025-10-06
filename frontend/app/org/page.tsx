import React from 'react';
import './org.css'

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

const Org: React.FC = () => {
    return (
        <div className='orgBody'>
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