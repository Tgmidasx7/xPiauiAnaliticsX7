import { describe, expect, it } from "vitest";
import {
  allCameras,
  allEvents,
  calculateMetrics,
  datasets,
  getArea,
  getScopedCamera,
  isScopeId,
} from "./index";

describe("conjuntos territoriais paralelos", () => {
  it("expõe Piauí e Teresina Capital com todas as camadas", () => {
    expect(Object.keys(datasets)).toEqual(["piaui", "teresina"]);
    for (const dataset of Object.values(datasets)) {
      expect(dataset.areas).toHaveLength(5);
      expect(dataset.cameras.length).toBeGreaterThan(0);
      expect(dataset.events.length).toBeGreaterThan(0);
      expect(dataset.vehicleReadings.length).toBeGreaterThan(0);
      expect(dataset.networkLinks.length).toBeGreaterThan(0);
      expect(dataset.educationUnits.length).toBeGreaterThan(0);
      expect(dataset.educationPrograms).toHaveLength(6);
      expect(dataset.securityOccurrences.length).toBeGreaterThan(0);
      expect(dataset.securityUnits.length).toBeGreaterThan(0);
      expect(dataset.securityPrograms).toHaveLength(6);
      expect(dataset.briefing).toHaveLength(4);
      expect(dataset.snapshotIso).toBe("2026-11-13T12:00:00.000Z");
    }
  });
  it("não compartilha IDs de câmeras/eventos entre versões e valida referências de área", () => {
    expect(new Set(allCameras.map((camera) => camera.id)).size).toBe(allCameras.length);
    expect(new Set(allEvents.map((event) => event.id)).size).toBe(allEvents.length);
    for (const dataset of Object.values(datasets)) {
      for (const camera of dataset.cameras) {
        expect(camera.scope).toBe(dataset.id);
        expect(getArea(dataset, camera.region)?.scope).toBe(dataset.id);
      }
      for (const event of dataset.events) {
        expect(event.scope).toBe(dataset.id);
        expect(getScopedCamera(dataset, event.cameraId)).toBeDefined();
        expect(getArea(dataset, event.region)).toBeDefined();
      }
      for (const unit of [...dataset.educationUnits, ...dataset.securityUnits]) {
        expect(unit.scope).toBe(dataset.id);
        expect(getArea(dataset, unit.areaId)).toBeDefined();
      }
      for (const occurrence of dataset.securityOccurrences) {
        expect(occurrence.scope).toBe(dataset.id);
        expect(getArea(dataset, occurrence.areaId)).toBeDefined();
      }
    }
    expect(getScopedCamera(datasets.piaui, "TER-CAM-001")).toBeUndefined();
    expect(getScopedCamera(datasets.teresina, "CAM-001")).toBeUndefined();
  });
  it("deriva métricas do próprio inventário, sem valores fixos por versão", () => {
    for (const dataset of Object.values(datasets)) {
      const metrics = calculateMetrics({ ...dataset, vehicleVolume: 10 });
      expect(metrics.onlineCameras).toBe(
        dataset.cameras.filter((camera) => camera.status === "online").length,
      );
      expect(metrics.healthyLinks).toBe(
        dataset.networkLinks.filter((link) => link.status === "healthy").length,
      );
      expect(metrics.educationDevicesAvailable).toBe(
        dataset.educationUnits.reduce((sum, unit) => sum + unit.devicesAvailable, 0),
      );
      expect(metrics.securityOpen).toBe(
        dataset.securityOccurrences.filter((item) => item.status !== "closed").length,
      );
      expect(metrics.vehicleReadingsVolume).toBe(10);
      expect(dataset.metrics).toEqual(
        calculateMetrics({ ...dataset, vehicleVolume: dataset.metrics.vehicleReadingsVolume }),
      );
    }
    expect(datasets.piaui.cameras).toHaveLength(36);
    expect(datasets.teresina.cameras).toHaveLength(25);
    expect(datasets.piaui.educationUnits).toHaveLength(40);
    expect(datasets.teresina.educationUnits).toHaveLength(30);
  });
  it("reconhece apenas escopos suportados", () => {
    expect(isScopeId("piaui")).toBe(true);
    expect(isScopeId("teresina")).toBe(true);
    expect(isScopeId("capital")).toBe(false);
    expect(isScopeId(null)).toBe(false);
  });
});
