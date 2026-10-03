/**
 * ARK Infra — Dynamic API Client & Public Page Hydration
 * Seamlessly injects dynamic MongoDB data into the existing HTML/CSS design
 * with graceful fallbacks if backend is offline.
 */

const ARK_API_BASE = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
  ? "http://localhost:8000/api"
  : "https://arkinfravizagadminportal.vercel.app/api";

const ArkApi = {
  /**
   * Fetches the current active announcement for the homepage banner.
   */
  async getActiveAnnouncement() {
    try {
      const res = await fetch(`${ARK_API_BASE}/public/announcements/active?t=${Date.now()}`);
      if (res.ok && res.status === 200) {
        return await res.json();
      }
    } catch (e) {
      console.warn("ARK API: Announcement offline or unreachable, using fallback.");
    }
    return null;
  },

  /**
   * Fetches all directors and their assigned agent counts.
   */
  async getDirectors() {
    try {
      const res = await fetch(`${ARK_API_BASE}/public/directors?t=${Date.now()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("ARK API: Directors offline or unreachable.");
    }
    return [];
  },

  /**
   * Fetches all agents assigned to a specific director.
   */
  async getAgentsByDirector(directorId) {
    try {
      const res = await fetch(`${ARK_API_BASE}/public/directors/${directorId}/agents?t=${Date.now()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(`ARK API: Agents for director ${directorId} unreachable.`);
    }
    return [];
  },

  /**
   * Fetches published gallery photos by category.
   */
  async getGallery(category = "all") {
    try {
      let url = `${ARK_API_BASE}/public/gallery`;
      const params = new URLSearchParams();
      if (category && category !== "all") {
        params.append("category", category);
      }
      params.append("t", Date.now().toString());
      const res = await fetch(`${url}?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("ARK API: Gallery unreachable, displaying static gallery.");
    }
    return [];
  },

  /**
   * Fetches published projects for public display.
   */
  async getProjects(statusFilter = "all") {
    try {
      let url = `${ARK_API_BASE}/public/projects`;
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.append("status_filter", statusFilter);
      }
      params.append("t", Date.now().toString());
      const res = await fetch(`${url}?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("ARK API: Projects unreachable, using static fallback.");
    }
    return [];
  }
};

// Automatic hydration helper for the Homepage Announcement Banner
async function hydrateHomepageAnnouncement() {
  const banner = document.getElementById("ceoUpdateBanner");
  const textEl = document.getElementById("ceoUpdateText");
  const badgeEl = document.getElementById("ceoUpdateBadge") || document.querySelector(".ceo-badge");
  if (!banner || !textEl) return;

  const ann = await ArkApi.getActiveAnnouncement();
  if (ann && ann.message && ann.message.trim()) {
    if (badgeEl && ann.title && ann.title.trim()) {
      badgeEl.textContent = ann.title.trim();
    }
    textEl.textContent = ann.message.trim();
    banner.style.display = "flex";
  }
}

// Export ArkApi globally
window.ArkApi = ArkApi;

