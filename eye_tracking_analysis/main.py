import os
import pandas as pd
from src.fixation_detector import FixationDetector
from src.aoi_manager import AOIManager
from src.metrics_calculator import MetricsCalculator
from src.visualizer import Visualizer

def main():
    # Crea le directory per l'output se non esistono
    os.makedirs('output/heatmaps', exist_ok=True)
    os.makedirs('output/reports', exist_ok=True)
    
    # Percorso del file CSV con i dati di eye tracking
    csv_file = "data/eye_tracking_data.csv"
    
    try:
        # Carica i dati
        print(f"Caricamento dei dati da {csv_file}...")
        data = pd.read_csv(csv_file)
        
        # Rileva le fissazioni
        print("Rilevamento delle fissazioni...")
        detector = FixationDetector(dispersion_threshold=100, duration_threshold=200)
        fixations = detector.detect_fixations(data)
        print(f"Rilevate {len(fixations)} fissazioni.")
        
        # Definisci le AOI
        print("Definizione delle Aree di Interesse (AOI)...")
        aoi_manager = AOIManager()
        logo_aoi = aoi_manager.define_aoi("", 50, 50, 200, 100)
        menu_aoi = aoi_manager.define_aoi("", 0, 150, 200, 400)
        content_aoi = aoi_manager.define_aoi("", 250, 150, 600, 400)
        print(f"Definite {len(aoi_manager.get_all_aois())} AOI.")
        
        # Calcola le metriche
        print("Calcolo delle metriche...")
        calculator = MetricsCalculator(fixations, aoi_manager)
        
        # Genera report dettagliato
        report = calculator.summary_report()
        
        # Mostra risultati
        print("\nRisultati dell'analisi:")
        print(f"Durata registrazione: {report['recording_duration_ms']/1000:.2f} secondi")
        print(f"Numero di fissazioni: {report['n_fixations']}")
        print(f"Durata media fissazione: {report['mean_fixation_duration']:.2f} ms")
        print(f"Frequenza fissazioni: {report['fixation_rate']:.2f} fissazioni/secondo")
        
        print("\nMetriche per AOI:")
        for aoi_stat in report['aois']:
            print(f"\nAOI: {aoi_stat['name']}")
            print(f"  TTFF: {aoi_stat['ttff']} ms")
            print(f"  Dwell Time: {aoi_stat['dwell_time']} ms")
            print(f"  Numero fissazioni: {aoi_stat['fixation_count']}")
            print(f"  Durata media fissazione: {aoi_stat['mean_fixation_duration']:.2f} ms")
        
        # Crea visualizzazioni
        print("\nGenerazione delle visualizzazioni...")
        visualizer = Visualizer(fixations, aoi_manager)
        
        # Genera e salva la heatmap
        visualizer.generate_heatmap(
            width=1024, 
            height=768, 
            sigma=50, 
            output_path="output/heatmaps/heatmap.png"
        )
        
        # Genera e salva lo scanpath
        visualizer.visualize_scanpath(
            output_path="output/reports/scanpath.png"
        )
        
        print("\nAnalisi completata con successo!")
        
    except Exception as e:
        print(f"Errore durante l'analisi: {e}")

if __name__ == "__main__":
    main()