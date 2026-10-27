import React from 'react';
import {createRoot} from 'react-dom/client';
import Dashboard from '../app/dashboard';
import Student from '../app/join/[id]/student';
import '../app/globals.css';
const match=window.location.pathname.match(/^\/join\/([\w-]+)\/?$/);
createRoot(document.getElementById('root')!).render(match?<Student sessionId={match[1]}/>:<Dashboard/>);
