import asyncio
from app.core.database import connect_to_mongo, db_manager
from app.routers.agents import _format_agent

async def main():
    await connect_to_mongo()
    agents_col = db_manager.db["agents"]
    directors_col = db_manager.db["directors"]
    
    directors = await directors_col.find().to_list(length=100)
    d_map = {str(d["_id"]): d.get("name", "Director") for d in directors}
    print("Director map:", d_map)
    
    count = await agents_col.count_documents({})
    print("Total agents count in DB:", count)
    
    agents = await agents_col.find().sort("created_at", -1).to_list(length=500)
    print("Fetched agents count:", len(agents))
    
    formatted = [_format_agent(a, d_map.get(str(a.get("director_id")), "Director")) for a in agents]
    print("Formatted agents sample (first 5):", formatted[:5])
    
    db_manager.client.close()

if __name__ == "__main__":
    asyncio.run(main())
