import DashboardCard from '../components/DashboardCard'; 

export default function Dashboard() {
  return (
    <div className="cards-grid">
      <DashboardCard title="Last Course">
        <p>Chapter 2 – Building Encounters (resume here)</p>
      </DashboardCard>
      <DashboardCard title="Current Campaign">
        <p>The Lost Mines of Phandelver</p>
        <ul className="card-list">
          <li>3 active characters</li>
          <li>2 locations open</li>
        </ul>
      </DashboardCard>
      <DashboardCard title="Character Sheets">
        <p className="text-muted">No character sheets yet. Create one to get started.</p>
      </DashboardCard>
      <DashboardCard title="Quick Stats">
        <p>2 courses completed</p>
        <p>1 campaign in progress</p>
      </DashboardCard>
    </div>
  );
}