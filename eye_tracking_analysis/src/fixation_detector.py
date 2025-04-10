import pandas as pd
import numpy as np

class FixationDetector:
    def __init__(self, dispersion_threshold=100, duration_threshold=200):
        """
        Inizializza il rilevatore di fissazioni.
        
        Args:
            dispersion_threshold: Soglia di dispersione (in pixel) per considerare una fissazione
            duration_threshold: Durata minima (in ms) per considerare una fissazione valida
        """
        self.dispersion_threshold = dispersion_threshold
        self.duration_threshold = duration_threshold
        
    def detect_fixations(self, data):
        """
        Rileva le fissazioni dai dati di eye tracking usando un algoritmo di dispersione.
        
        Args:
            data: DataFrame pandas con colonne 'x', 'y', 'timestamp'
            
        Returns:
            DataFrame contenente le fissazioni rilevate
        """
        # Verifica che le colonne necessarie siano presenti
        required_cols = ['x', 'y', 'timestamp']
        for col in required_cols:
            if col not in data.columns:
                raise ValueError(f"Il dataframe deve contenere la colonna '{col}'")
        
        # Ordina i dati per timestamp
        data = data.sort_values('timestamp').reset_index(drop=True)
        
        x = data['x'].values
        y = data['y'].values
        timestamps = data['timestamp'].values
        
        fixations = []
        current_points = []
        start_time = timestamps[0]
        
        for i in range(len(x)):
            if not current_points:
                current_points.append((x[i], y[i], timestamps[i]))
                continue
            
            # Calcola la dispersione con il nuovo punto
            points_with_new = current_points + [(x[i], y[i], timestamps[i])]
            xs = [p[0] for p in points_with_new]
            ys = [p[1] for p in points_with_new]
            
            dispersion = (max(xs) - min(xs)) + (max(ys) - min(ys))
            
            if dispersion <= self.dispersion_threshold:
                # Il punto appartiene alla fissazione corrente
                current_points.append((x[i], y[i], timestamps[i]))
            else:
                # Controlla se la fissazione corrente rispetta la durata minima
                duration = current_points[-1][2] - start_time
                if duration >= self.duration_threshold:
                    # Calcola il centroide
                    fix_x = sum(p[0] for p in current_points) / len(current_points)
                    fix_y = sum(p[1] for p in current_points) / len(current_points)
                    
                    fixations.append({
                        'x': fix_x, 
                        'y': fix_y,
                        'start_time': start_time,
                        'end_time': current_points[-1][2],
                        'duration': duration
                    })
                
                # Inizia una nuova potenziale fissazione
                current_points = [(x[i], y[i], timestamps[i])]
                start_time = timestamps[i]
        
        # Controlla l'ultima potenziale fissazione
        if current_points:
            duration = current_points[-1][2] - start_time
            if duration >= self.duration_threshold:
                fix_x = sum(p[0] for p in current_points) / len(current_points)
                fix_y = sum(p[1] for p in current_points) / len(current_points)
                
                fixations.append({
                    'x': fix_x, 
                    'y': fix_y,
                    'start_time': start_time,
                    'end_time': current_points[-1][2],
                    'duration': duration
                })
        
        return pd.DataFrame(fixations)