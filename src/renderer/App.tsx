import './App.css';
import React, { useState } from 'react';
import Esymia from './esymia/Esymia';
import Cadmia from './cadmia/Cadmia';
import Home from './home/Home';
import { useAuth0 } from '@auth0/auth0-react';


export default function App() {

  const [tabsSelected, setTabsSelected] = useState<string>('home');
  const { user } = useAuth0();
  return (
    <>
      <div role="tablist" className="tabs tabs-bordered w-full justify-center h-[3vh]">
        <input type="radio" name="dashboard" role="tab" className={`tab`} aria-label="Home" checked={tabsSelected === 'home'}
               onClick={() => setTabsSelected('home')}
        />
        <input type="radio" name="cadmia" role="tab" className={`tab`} aria-label="CADmIA" checked={tabsSelected === 'cadmia'}
               disabled={!user}
               onClick={() => setTabsSelected('cadmia')}
        />
        <input type="radio" name="esymia" role="tab" className={`tab`} aria-label="ESymIA" checked={tabsSelected === 'esymia'}
               disabled={!user}
               onClick={() => setTabsSelected('esymia')}
        />
      </div>
      {tabsSelected === 'home' && <Home setSelectedTab={setTabsSelected}/>}
      <Cadmia selectedTab={tabsSelected}/>
      <Esymia selectedTab={tabsSelected}/>
    </>

  );
}
