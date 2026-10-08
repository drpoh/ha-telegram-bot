import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('store',Path(__file__).parents[1]/'scripts/lighting-registration-store.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class StoreTests(unittest.TestCase):
 def test_pending_no_ai_grants(self):
  c={'entityId':'light.koridor_2','room':'koridor','name':'Второй свет','reviewMode':'browser_demo_only'}
  result=m.register({},c,{'entities':[{'entity_id':'light.koridor_2','platform':'mqtt','disabled':False}]})
  x=result['devices']['light.koridor_2']
  self.assertEqual(x['status'],'pending_physical_verification')
  self.assertFalse(x['ai_authorized'])
 def test_reject_unknown_and_disabled(self):
  for catalog in ({'entities':[]},{'entities':[{'entity_id':'light.koridor_2','disabled':True}]}):
   with self.assertRaises(ValueError):m.register({}, {'entityId':'light.koridor_2','room':'koridor','name':'ok','reviewMode':'browser_demo_only'},catalog)
if __name__=='__main__':unittest.main()
