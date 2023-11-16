import { WEATHER_API_KEY } from '@env';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [permission, setPermission] = useState(true);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setPermission(false);
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync();
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
    setCity(location[0].city);

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`);
    const json = await response.json();

    setDays(
      json.list.filter((weather) => {
        if (weather.dt_txt.includes('00:00:00')) {
          return weather;
        }
      }),
    );
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.weather}>
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator color='black' size='large' />
          </View>
        ) : (
          days.map((day, idx) => (
            <View key={idx} style={styles.day}>
              <Text style={styles.temp}>{parseFloat(day.main.temp).toFixed(1)}</Text>
              <Text style={styles.main}>{day.weather[0].main}</Text>
              <Text style={styles.description}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffd400',
  },

  city: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cityName: {
    fontSize: 68,
    fontWeight: '500',
  },

  weather: {},

  day: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },

  temp: {
    marginTop: 50,
    fontSize: 178,
  },

  main: {
    fontSize: 60,
    marginTop: -30,
  },
  description: {
    fontSize: 20,
  }
});
