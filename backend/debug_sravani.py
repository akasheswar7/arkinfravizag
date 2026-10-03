import asyncio
from app.core.database import connect_to_mongo, db_manager

async def main():
    await connect_to_mongo()
    directors_col = db_manager.db["directors"]
    agents_col = db_manager.db["agents"]

    directors = await directors_col.find().to_list(length=100)
    print("=== DIRECTORS ===")
    for d in directors:
        d_id = str(d["_id"])
        name = d.get("name", "")
        # count agents
        a_count = await agents_col.count_documents({"director_id": d_id})
        a_count_name = await agents_col.count_documents({"team_head_name": name})
        print(f"Director ID: '{d_id}' | Name: '{name}' | Count by ID: {a_count} | Count by Name: {a_count_name}")

    print("\n=== AGENTS WITH UNMATCHED DIRECTOR_ID ===")
    d_ids = {str(d["_id"]) for d in directors}
    all_agents = await agents_col.find().to_list(length=500)
    unmatched = [a for a in all_agents if str(a.get("director_id", "")) not in d_ids]
    print(f"Total agents: {len(all_agents)}, Unmatched agents count: {len(unmatched)}")
    for a in unmatched[:10]:
        print(f"Agent ID: '{a['_id']}' | Name: '{a.get('full_name')}' | director_id: '{a.get('director_id')}' | team_head_name: '{a.get('team_head_name')}'")

    db_manager.client.close()

if __name__ == "__main__":
    asyncio.run(main())
