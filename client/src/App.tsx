import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import JsonFormatter from './components/tools/JsonFormatter';
import Base64Encoder from './components/tools/Base64Encoder';
import RegexTester from './components/tools/RegexTester';
import TimestampConverter from './components/tools/TimestampConverter';
import UrlParser from './components/tools/UrlParser';
import JwtParser from './components/tools/JwtParser';
import UuidGenerator from './components/tools/UuidGenerator';
import MarkdownEditor from './components/tools/MarkdownEditor';
import ColorConverter from './components/tools/ColorConverter';

function App() {
  return (
    <Router>
      <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<JsonFormatter />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/json" element={<JsonFormatter />} />
          <Route path="/base64" element={<Base64Encoder />} />
          <Route path="/regex" element={<RegexTester />} />
          <Route path="/timestamp" element={<TimestampConverter />} />
          <Route path="/url" element={<UrlParser />} />
          <Route path="/markdown" element={<MarkdownEditor />} />
          <Route path="/jwt" element={<JwtParser />} />
          <Route path="/uuid" element={<UuidGenerator />} />
          <Route path="/color" element={<ColorConverter />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;