import os
import pandas as pd
from src.fixation_detector import FixationDetector
from src.aoi_manager import AOIManager, setup_aois_for_ecommerce
from src.metrics_calculator import MetricsCalculator
from src.visualizer import Visualizer

def main():
    # Crea le directory per l'output se non esistono
    os.makedirs('output/heatmaps', exist_ok=True)
    os.makedirs('output/reports', exist_ok=True)
    
    # Percorso del file CSV con i dati di eye tracking
    csv_file = "/Users/danieladilucchio/Desktop/shopeyetracking/eye_tracking_analysis/data/eye_tracking_data.csv"
    
    # Pagina che stiamo analizzando (potrebbe essere un parametro)
    current_page = "home"  # Opzioni: "home", "cart", "product", "category", "checkout"
    
    try:
        # Carica i dati
        print(f"Caricamento dei dati da {csv_file}...")
        data = pd.read_csv(csv_file)
        
        # Rileva le fissazioni
        print("Rilevamento delle fissazioni...")
        detector = FixationDetector(dispersion_threshold=100, duration_threshold=200)
        fixations = detector.detect_fixations(data)
        print(f"Rilevate {len(fixations)} fissazioni.")
        
        # Definisci le AOI per tutte le pagine
        print("Definizione delle Aree di Interesse (AOI)...")
        aoi_manager = AOIManager()
        page_aois = setup_aois_for_ecommerce(aoi_manager)
        
        # Verifica che la pagina richiesta esista
        if current_page not in page_aois:
            available_pages = aoi_manager.get_all_pages()
            raise ValueError(f"La pagina '{current_page}' non è definita. Pagine disponibili: {available_pages}")
        
        # Imposta la pagina corrente nell'aoi_manager
        aoi_manager.set_current_page(current_page)
        
        # Seleziona le AOI per la pagina corrente
        current_aois = page_aois[current_page]
        print(f"Analisi della pagina: {current_page}")
        
        # Ottieni i nomi delle AOI per la pagina corrente
        aoi_names = [aoi_manager.get_aoi(aoi_info)['name'] for aoi_info in current_aois.values()]
        print(f"AOI attive: {', '.join(aoi_names)}")
        
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
            # Trova l'AOI nella pagina corrente che corrisponde al nome nell'aoi_stat
            matching_aoi = next((key for key, val in current_aois.items() 
                            if aoi_manager.get_aoi(val)['name'] == aoi_stat['name']), None)
            
            if matching_aoi is not None:
                print(f"\nAOI: {aoi_stat['name']} ({matching_aoi})")
                print(f"  TTFF: {aoi_stat['ttff'] if aoi_stat['ttff'] is not None else 'N/A'} ms")
                print(f"  Dwell Time: {aoi_stat['dwell_time']} ms")
                print(f"  Numero fissazioni: {aoi_stat['fixation_count']}")
                print(f"  Durata media fissazione: {aoi_stat['mean_fixation_duration']:.2f} ms")
        
        # Crea visualizzazioni
        print("\nGenerazione delle visualizzazioni...")
        visualizer = Visualizer(fixations, aoi_manager)
        
        # Genera e salva la heatmap
        visualizer.generate_heatmap(
            width=1440,  # Aggiornato per corrispondere alle nuove dimensioni delle AOI
            height=900,  # Aggiornato per corrispondere alle nuove dimensioni delle AOI
            sigma=50, 
            output_path=f"output/heatmaps/heatmap_{current_page}.png",
            page_name=current_page
            # Decommentare la riga seguente se hai screenshot disponibili
            # background_img=f"data/screenshots/{current_page}_screenshot.png"
        )
        
        # Genera e salva lo scanpath
        visualizer.visualize_scanpath(
            output_path=f"output/reports/scanpath_{current_page}.png",
            page_name=current_page
            # Decommentare la riga seguente se hai screenshot disponibili
            # background_img=f"data/screenshots/{current_page}_screenshot.png"
        )
        
        print(f"\nAnalisi completata con successo per la pagina {current_page}!")
        
    except Exception as e:
        print(f"Errore durante l'analisi: {e}")
        import traceback
        traceback.print_exc()  # Stampa il traceback completo per debug

if __name__ == "__main__":
    main()