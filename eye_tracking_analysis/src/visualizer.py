import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Rectangle

class Visualizer:
    def __init__(self, fixations, aoi_manager=None):
        """
        Inizializza il visualizzatore.
        
        Args:
            fixations: DataFrame con le fissazioni
            aoi_manager: Istanza di AOIManager (opzionale)
        """
        self.fixations = fixations
        self.aoi_manager = aoi_manager
        
    def generate_heatmap(self, width, height, sigma=50, output_path=None):
        """
        Genera una heatmap basata sulle fissazioni.
        
        Args:
            width, height: Dimensioni dell'immagine
            sigma: Parametro di diffusione gaussiana
            output_path: Percorso per salvare l'immagine (opzionale)
            
        Returns:
            Figure di matplotlib con la heatmap
        """
        if self.fixations.empty:
            print("Nessuna fissazione disponibile per generare la heatmap.")
            return None
        
        # Crea una matrice vuota per la heatmap
        heatmap = np.zeros((height, width))
        
        # Aggiungi ogni fissazione alla heatmap, pesata per durata
        for _, fixation in self.fixations.iterrows():
            x, y = int(fixation['x']), int(fixation['y'])
            
            # Assicurati che x, y siano all'interno dei limiti
            if 0 <= x < width and 0 <= y < height:
                # Peso basato sulla durata della fissazione
                weight = fixation['duration'] / 1000.0  # Converti in secondi
                
                # Calcola intervalli per la maschera gaussiana
                y_start = max(0, y-3*sigma)
                y_end = min(height, y+3*sigma)
                x_start = max(0, x-3*sigma)
                x_end = min(width, x+3*sigma)
                
                # Crea coordinate della griglia
                y_indices, x_indices = np.mgrid[y_start:y_end, x_start:x_end]
                
                # Calcola la distanza dal centro
                distances = np.sqrt((x_indices - x)**2 + (y_indices - y)**2)
                
                # Calcola il contributo gaussiano
                contribution = weight * np.exp(-(distances**2) / (2 * sigma**2))
                
                # Aggiungi alla heatmap
                heatmap[y_start:y_end, x_start:x_end] += contribution
        
        # Normalizza la heatmap
        if np.max(heatmap) > 0:
            heatmap = heatmap / np.max(heatmap)
        
        # Crea la figura
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Crea una mappa di colori personalizzata (trasparente -> rosso -> giallo)
        colors = [(0, 0, 0, 0), (1, 0, 0, 0.7), (1, 1, 0, 0.9)]
        cmap = LinearSegmentedColormap.from_list('heatmap_cmap', colors, N=256)
        
        # Visualizza la heatmap
        im = ax.imshow(heatmap, cmap=cmap, interpolation='bilinear')
        
        # Aggiungi le AOI alla figura, se disponibili
        if self.aoi_manager:
            for aoi in self.aoi_manager.get_all_aois():
                rect = Rectangle(
                    (aoi['x_min'], aoi['y_min']),
                    aoi['width'], aoi['height'],
                    linewidth=2, edgecolor='blue', facecolor='none'
                )
                ax.add_patch(rect)
                ax.text(
                    aoi['x_min'], aoi['y_min'] - 10,
                    aoi['name'],
                    color='blue', fontsize=10, weight='bold'
                )
        
        ax.set_title('Eye Tracking Heatmap')
        plt.colorbar(im, ax=ax, label='Intensità di fissazione (normalizzata)')
        
        # Salva la figura se richiesto
        if output_path:
            fig.savefig(output_path, dpi=300, bbox_inches="tight")
            print(f"Heatmap salvata come '{output_path}'")
        
        return fig
    
    def visualize_scanpath(self, output_path=None):
        """
        Visualizza il percorso di scansione (scanpath).
        
        Args:
            output_path: Percorso per salvare l'immagine (opzionale)
            
        Returns:
            Figure di matplotlib con lo scanpath
        """
        if self.fixations.empty:
            print("Nessuna fissazione disponibile per visualizzare lo scanpath.")
            return None
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Definisci limiti del grafico in base ai dati
        x_max = self.fixations['x'].max() * 1.1
        y_max = self.fixations['y'].max() * 1.1
        
        # Ordina fissazioni cronologicamente
        sorted_fix = self.fixations.sort_values('start_time')
        
        # Disegna la saccade (linea tra fissazioni)
        for i in range(len(sorted_fix) - 1):
            ax.plot(
                [sorted_fix.iloc[i]['x'], sorted_fix.iloc[i+1]['x']],
                [sorted_fix.iloc[i]['y'], sorted_fix.iloc[i+1]['y']],
                'b-', alpha=0.5
            )
        
        # Disegna le fissazioni come cerchi, dimensione proporzionale alla durata
        for i, fixation in sorted_fix.iterrows():
            size = fixation['duration'] / 30  # Scala la dimensione in base alla durata
            ax.scatter(fixation['x'], fixation['y'], s=size, alpha=0.7, color='red')
            
            # Aggiungi numero progressivo per mostrare l'ordine delle fissazioni
            order = sorted_fix.index.get_loc(i) + 1
            ax.text(fixation['x']+10, fixation['y']+10, str(order), fontsize=9)
        
        # Aggiungi le AOI, se disponibili
        if self.aoi_manager:
            for aoi in self.aoi_manager.get_all_aois():
                rect = Rectangle(
                    (aoi['x_min'], aoi['y_min']),
                    aoi['width'], aoi['height'],
                    linewidth=2, edgecolor='green', facecolor='none'
                )
                ax.add_patch(rect)
                ax.text(
                    aoi['x_min'], aoi['y_min'] - 10,
                    aoi['name'],
                    color='green', fontsize=10, weight='bold'
                )
        
        ax.set_xlim(0, x_max)
        ax.set_ylim(y_max, 0)  # Inverti asse y per coordinate schermo
        ax.set_title('Scanpath Eye Tracking')
        ax.set_xlabel('Posizione X (pixel)')
        ax.set_ylabel('Posizione Y (pixel)')
        
        # Salva la figura se richiesto
        if output_path:
            fig.savefig(output_path, dpi=300, bbox_inches="tight")
            print(f"Scanpath salvato come '{output_path}'")
        
        return fig