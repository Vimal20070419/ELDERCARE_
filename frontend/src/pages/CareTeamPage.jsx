import { Users, Mail, Phone, MapPin, ShieldCheck, Star } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function CareTeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Jenkins',
      role: 'Primary Care Physician',
      specialty: 'Geriatrics',
      phone: '(555) 123-4567',
      email: 'dr.jenkins@caremonitor.com',
      location: 'Central Clinic, Room 402',
      isPrimary: true,
      image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    {
      id: 2,
      name: 'Michael Rodriguez, RN',
      role: 'Lead Nurse',
      specialty: 'Daily Monitoring',
      phone: '(555) 987-6543',
      email: 'm.rodriguez@caremonitor.com',
      location: 'Mobile Unit A',
      isPrimary: false,
      image: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    },
    {
      id: 3,
      name: 'Amanda Chen',
      role: 'Care Coordinator',
      specialty: 'Logistics & Support',
      phone: '(555) 555-0198',
      email: 'a.chen@caremonitor.com',
      location: 'Main Office',
      isPrimary: false,
      image: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    }
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-layout">
          {/* Main Detail Area */}
          <div className="main-feed" style={{ padding: '0' }}>
            <div className="page-header" style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)', background: 'white' }}>
              <div>
                <h2 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Your Care Team</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact information and roles for your dedicated healthcare professionals.</p>
              </div>
            </div>

            <div className="page-body" style={{ padding: '32px 40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {teamMembers.map((member) => (
                  <div key={member.id} className="card" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                    {member.isPrimary && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'var(--warning-bg)', color: 'var(--warning-dark)',
                        padding: '4px 10px', borderRadius: '99px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        <Star size={12} fill="currentColor" /> Primary
                      </div>
                    )}
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <img src={member.image} alt={member.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bg-deep)' }} />
                       <div>
                         <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>{member.name}</h3>
                         <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{member.role}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.specialty}</div>
                       </div>
                    </div>
                    <div style={{ padding: '20px 24px', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                         <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                           <Phone size={14} />
                         </div>
                         {member.phone}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                         <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                           <Mail size={14} />
                         </div>
                         {member.email}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                         <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                           <MapPin size={14} />
                         </div>
                         {member.location}
                       </div>
                    </div>
                    <div style={{ padding: '16px 24px', display: 'flex', gap: '12px' }}>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Message</button>
                      <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Book Appt</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <aside className="right-panel">
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h4>Emergency Contacts</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div style={{ padding: 20, background: 'var(--danger-bg)', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h5 style={{ color: 'var(--danger-dark)', fontSize: '0.9rem', marginBottom: 4 }}>Emergency Services</h5>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', marginBottom: 12 }}>911</p>
                    <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}>Call Now</button>
                 </div>
                 <div style={{ padding: 20, background: 'var(--bg-deep)', borderRadius: 16, border: '1px solid var(--border)' }}>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 4 }}>Family Contact</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>John Doe (Son)</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>(555) 234-5678</p>
                 </div>
              </div>
            </div>
            
            <div style={{ padding: 24, background: 'var(--success-bg)', borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
               <ShieldCheck size={28} color="var(--success)" style={{ flexShrink: 0 }} />
               <div>
                 <h5 style={{ color: 'var(--success-dark)', fontSize: '0.9rem', marginBottom: 4 }}>Secure Communication</h5>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All messages sent to your care team are encrypted and HIPAA compliant.</p>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
